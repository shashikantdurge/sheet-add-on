class FirestoreApi {
    key: string
    constructor(key) {
        this.key = key
    }

    commit(obj) {
        var options: object = {
            'method': 'post',
            "muteHttpExceptions": true,
            'payload': JSON.stringify(obj),
            'contentType': 'json'
        };
        var url = 'https://firestore.googleapis.com/v1beta1/projects/bmsce-flutter/databases/(default)/documents:commit?key=' + this.key;
        var response = UrlFetchApp.fetch(url, options);

        var responseCode = response.getResponseCode()
        var responseBody = response.getContentText()
        if (responseCode === 200) {
            responseCode = JSON.parse(responseBody)
        } else {
            console.error(Utilities.formatString("Commit failed. Status %d: %s", responseCode, responseBody))
        }
        return new FirestoreResponse(responseCode, responseBody)
    }
}

class FirestoreResponse {
    responseCode: number
    respnseBody: object

    constructor(code, body) {
        this.responseCode = code
        this.respnseBody = body
    }
}