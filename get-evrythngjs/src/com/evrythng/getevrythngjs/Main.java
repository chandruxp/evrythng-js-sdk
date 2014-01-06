package com.evrythng.getevrythngjs;

import java.awt.GraphicsEnvironment;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.channels.FileChannel;
import java.util.Date;
import java.util.Properties;

import javax.swing.JOptionPane;

/*
 * (c) Copyright 2013 EVRYTHNG Ltd London / Zurich
 * www.evrythng.com
 */

public class Main {

	private static Properties propDefault;
	private static Properties propUser;

	private static boolean noGui = false;
	private static boolean watch = false;
	private static File execDir;

	public static void main(String[] args) throws URISyntaxException, MalformedURLException {

		if (args.length > 0 && "nogui".equals(args[0])) {
			noGui = true;
		}
		if (args.length > 0 && "watch".equals(args[0])) {
			watch = true;
		}

		execDir = getExecutionDirectory();
		System.out.println("Execution directory: " + execDir.toString());

		propDefault = new Properties();
		File filePropDefault = new File(execDir, "get-evrythngjs.properties");
		try {
			propDefault.load(new FileReader(filePropDefault));
		} catch (FileNotFoundException e) {
			System.err.println("File not found: " + filePropDefault);
			return;
		} catch (IOException e) {
			System.err.println("Error when reading file: " + filePropDefault);
			return;
		}

		propUser = new Properties();
		File filePropUser = new File(execDir, "get-evrythngjs.user.properties");
		try {
			propUser.load(new FileReader(filePropUser));
		} catch (FileNotFoundException e) {
			System.out.println("User overrides not found: " + filePropUser);
		} catch (IOException e) {
			System.err.println("Error when reading file: " + filePropUser);
			return;
		}

		File src;
		String source = getProp("evrythngjs.source");
		if (source.equals("github")) {
			URL url = new URL(getProp("evrythngjs.githublocation"));
			System.out.println("Downloading from " + url);
			try {
				src = download(url);
				System.out.println("Downloading complete.");
			} catch (IOException e) {
				System.err.println("Error when downloading the file: " + e.getMessage());
				return;
			}
		} else {
			src = new File(source.replace("{execDir}", execDir.toString()));
		}
		System.out.println("Source file: " + src);

		String[] destinations = getProp("evrythngjs.destination").split(",");

		if (watch) {

			long lm = 0;

			while (true) {
				long nlm = src.lastModified();
				if (nlm > lm) {
					lm = nlm;
					performCopy(src, destinations);
					System.out.println(new Date() + " - Watching source file for changes. Hit CTRL+C to abort.");
				}
				try {
					Thread.sleep(5000);
				} catch (InterruptedException e) {
					break;
				}
			}

		} else {
			int successes = performCopy(src, destinations);
			if (!noGui && !GraphicsEnvironment.isHeadless()) {
				if (successes == destinations.length) {
					JOptionPane.showMessageDialog(null, "Success.");
				} else {
					JOptionPane.showMessageDialog(null, "Failure. " + successes + "/" + destinations.length + " files copied. Run the script from a shell to see more details.");
				}
			}
		}
	}

	private static int performCopy(File src, String[] destinations) {

		int successes = 0;
		for (String destination : destinations) {
			File dstDir = new File(destination.replace("{execDir}", execDir.toString()));
			if (!dstDir.exists()) {
				System.out.print("Creating directory " + dstDir + "... ");
				if (dstDir.mkdir()) {
					System.out.println("[DONE]");
				} else {
					System.out.println("[FAIL]");
					System.err.println("Failed to create directory " + dstDir + ".");
					continue;
				}
			}
			File dst = new File(dstDir, "evrythng.js");
			System.out.print("Copying to " + dst + "... ");
			try {
				copyFile(src, dst);
				successes++;
				System.out.println("[DONE]");
			} catch (IOException e) {
				System.out.println("[FAIL]");
				System.err.println("Failed to copy from " + src + " to " + destination + ": " + e.getMessage());
			}
		}

		return successes;
	}

	private static File getExecutionDirectory() throws URISyntaxException {
		URL url = Main.class.getProtectionDomain().getCodeSource().getLocation();
		File f = new File(url.toURI());
		if (f.toString().endsWith(".jar")) {
			f = f.getParentFile();
		}
		return f;
	}

	private static String getProp(String key) {

		String r = propUser.getProperty(key, propDefault.getProperty(key));
		return r;
	}

	private static File download(URL url) throws IOException {

		BufferedInputStream in = null;
		BufferedOutputStream bout = null;
		File temp;

		try {
			temp = File.createTempFile("evrythngjs", ".js.tmp");

			in = new BufferedInputStream(url.openStream());
			FileOutputStream fos = new FileOutputStream(temp);
			bout = new BufferedOutputStream(fos);
			byte data[] = new byte[10240];
			int read;
			while ((read = in.read(data, 0, data.length)) >= 0) {
				bout.write(data, 0, read);
			}
		} finally {
			if (bout != null) {
				bout.close();
			}
			if (in != null) {
				in.close();
			}
		}

		return temp;
	}

	private static void copyFile(File sourceFile, File destFile) throws IOException {
		if (!destFile.exists()) {
			destFile.createNewFile();
		}

		FileInputStream source = null;
		FileOutputStream destination = null;
		try {
			source = new FileInputStream(sourceFile);
			FileChannel srcChan = source.getChannel();
			destination = new FileOutputStream(destFile);
			FileChannel dstChan = destination.getChannel();

			long count = 0;
			long size = srcChan.size();
			while ((count += dstChan.transferFrom(srcChan, count, size - count)) < size)
				;
		} finally {
			if (source != null) {
				source.close();
			}
			if (destination != null) {
				destination.close();
			}
		}
	}
}
