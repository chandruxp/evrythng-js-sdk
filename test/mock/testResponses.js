var TestResponses = {
  ok: {
    "status": 200
  },
  accessDenied: {
    "status": 403,
    "contentType": "application/json",
    "responseText": '{"errors":["Access was denied!"]}'
  },
  products: {
    all: {
      "status": 200,
      "responseHeaders": {
        "Content-type": "application/json",
        "X-Result-Count": "2"
      },
      "responseText": '[{"id":"1","fn":"qwer"},{"id":"2","fn":"qwerty"}]'
    },
    one: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"id":"1","name":"qwer"}'
    },
    updated: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"id":"1","name":"qwer","description":"desc"}'
    }
  },
  thngs: {
    all: {
      "status": 200,
      "responseHeaders": {
        "Content-type": "application/json",
        "X-Result-Count": "2"
      },
      "responseText": '[{"id":"123","name":"foo","product":"1"},{"id":"1234","name":"bar"}]'
    },
    one: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"id":"123","name":"foo","product":"1"}'
    },
    updated: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"id":"123","name":"bar","product":"1","description":"desc"}'
    }
  },
  collections: {
    all: {
      "status": 200,
      "responseHeaders": {
        "Content-type": "application/json",
        "X-Result-Count": "2"
      },
      "responseText": '[{"id":"123","name":"stuff"},{"id":"1234","name":"stuff2"}]'
    },
    one: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"id":"123","name":"stuff"}'
    },
    updated: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"id":"123","name":"stuffbar","description":"desc"}'
    }
  },
  properties:{
    all: {
      "status": 200,
      "responseHeaders": {
        "Content-type": "application/json",
        "X-Result-Count": "2"
      },
      "responseText": '[{"key":"status","value":"on","timestamp": 1402308744391},{"key":"level","value":"90","timestamp": 1402308817454}]'
    },
    one: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '[{"value":"on","timestamp": 1402308744391},{"value":"off","timestamp": 1402308817454}]'
    }
  },
  actionTypes: {
    all: {
      "status": 200,
      "responseHeaders": {
        "Content-type": "application/json",
        "X-Result-Count": "2"
      },
      "responseText": '[{"id":"123","name":"scans"},{"id":"2134","name":"_fake"}]'
    }
  },
  actions: {
    scans: {
      all: {
        "status": 200,
        "responseHeaders": {
          "Content-type": "application/json",
          "X-Result-Count": "2"
        },
        "responseText": '[{"id":"123","type":"scans","customFields":{"foo":"bar"}},{"id":"2134","type":"scans","user":"000"}]'
      },
      one: {
        "status": 200,
        "contentType": "application/json",
        "responseText": '{"id":"2134","type":"scans","user":"000"}'
      }
    }
  },
  multimedia: {
    all: {
      "status": 200,
      "responseHeaders": {
        "Content-type": "application/json",
        "X-Result-Count": "2"
      },
      "responseText": '[{"id":"123","name":"media1"},{"id":"1234","name":"media2"}]'
    },
    one: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"id":"123","name":"media1"}'
    },
    updated: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"id":"123","name":"media-updated","media":{"foo":"bar"}}'
    }
  },
  application: {
    withFacebook: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '[{"name":"abc","apiKey":"12345","socialNetworks":{"facebook":{"appId":"1428154137454112"}},"id":"app1"}]'
    },
    simple:{
      "status": 200,
      "contentType": "application/json",
      "responseText": '[{"name":"abc","apiKey":"12345","id":"app2"}]'
    },
    nonExistent:{
      "status": 404,
      "contentType": "application/json",
      "responseText": '{"errors":["Application not found"]}'
    }
  },
  auth: {
    facebook: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"evrythngApp":"123","socialNetwork":"facebook","socialNetworkId":"1234","access":{"expires":1406985261943,"token":"abc"},"evrythngUser":"testuserid","evrythngApiKey":"apikey","appId":"appid"}'
    },
    evrythng: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"evrythngApp":"123","evrythngUser":"testuserid","evrythngApiKey":"apikey","appId":"appid"}'
    },
    logout: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"logout":"ok"}'
    },
    create: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"evrythngUser":"123","activationCode":"activation123","status":"inactive","email":"foo@test.bar"}',
    },
    validate: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"evrythngUser":"123","status":"active","evrythngApiKey":"apikey123"}'
    }
  },
  facebook: {
    loginStatus: {
      connected: {
        authResponse: {
          accessToken: "fbTestAccessToken123"
        },
        status: "connected"
      },
      unknown: {
        authResponse: undefined,
        status: "unknown"
      }
    },
    me: {
      email: 'foo@test.bar',
      id: 'fb1234',
      name: 'FB Test Name'
    }
  },
  users: {
    one: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"email":"foo@test.bar","firstName":"EVT Test Name"}'
    },
    updated: {
      "status": 200,
      "contentType": "application/json",
      "responseText": '{"email":"foo@test.bar","firstName":"newName"}'
    }
  },
  jsonp: {
    thngs:{
      all: [
        {
          "id":"123",
          "name":"foo",
          "product":"1"
        },{
          "id":"1234",
          "name":"bar"
        }
      ]
    },
    accessDenied: {
      "status": "403",
      "errors": ["Access was denied!"]
    }
  }
};