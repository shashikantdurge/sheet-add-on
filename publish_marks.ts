let database = "projects/bmsce-flutter/databases/(default)"
var email = "update-courselist-in-firestore@bmsce-flutter.iam.gserviceaccount.com";
var key = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDlEk9x2ngRb4sc\ne49bKMjq49jU6GQvx5jTf1x/5wmvVsMA7TalM8Jw8NTX2PqesUldTwfqxz6WOlqk\nN8CzZ2nOIJ9Oo2cALRp9Wn+Q1z0+cHuo4tR3OJNSNAi/n5a3EDWJJu7pwZ0qTlTm\nQKvKs7pubU1ABq3M6zLz1K4KHZjFnpL0T4HqQbCzc+Cj1TAAg/b3JS2y3Q+LdV3C\nMfHB5ljiwxX4yWGiOynb1sMuFcUm+Po5jV0fME+F3ny6MQ9GuQhaKrStWGBgyIsd\ngYdKEOsJDUkUwtxVK4RdSOrXKkzc03YfumbvXo6bedRgy2rydQerSx7x5GkWHjAM\nGL/ni70bAgMBAAECggEAHpCNYiMk3yqzdJb1/1NXT6QcM/hYGdn3hczaIkTJEYix\nl0ePgYaA/MHdnHlao18Da3xWkZiJPNFHc97uiuGTCAppRzxdS3Q5Mx2mpMRbax/m\nGBhAAjJd0duYiTz5hq6WfhjgSvdnCZSPFnPtmCvYBdD2vELH4O5HC6rGmBnv3voz\ndmmy+guVgTEAPz1d3f2eGQKylO0bx19zU7rNq09B20qkLDTJ5NMTjbl1mRz291TM\nx6w6dI+IFBOouCr+XnNXqB1XpO9gIOXkprzzTMOGNUXizYOorhAq2BCBdb+fLZwZ\njIU6PB8t5fDPFPaEgCuRlDX6IeTMda7BYG3e/gGOQQKBgQD67bBQ04mMUTIXsQgM\nAQaGk9J3IlVK72PzF6Qi5g6mWawzfNus+Gse3ki0QjrkXoXZVztPKcoq5mfWuWWT\nWNqFOUJ2NpyduOm6vmoffsZEC4npNXricE+yzRcPamxowwap5kR7pCw7NnVZKj0Q\nD1HwJGhuDdxkIrGfjpJSCi1LQQKBgQDps4h6J0IaBt+JvEl0wj76ICvGIrKT1k4V\nmdGzdBtZK6RUnoiKiFKDUZrIoOwiOEZGaoZWPv+DePWMnJQUPKD8jNTe4rr306a8\nNh4JBdzL8SQ6DRV4W5rQomEXrliKjgQJOy4Gif7BnQ85ikQ+u7rsFqQ0+J0yeZKt\n76YIzyO9WwKBgA+m8/CWwWW3SuCfclkNV1LdtasowRlDhYCMYPisUQ2fWlZ721gW\nxtfOFcrotrO4EbFU96YgfTPf22pRdjyStk7JG5Q0I+DSwAGeDxCX39YuwhOB+oBV\ncSM+F8omYUzHnYrLikoMG5Y192vwbo6p5fqMytbSloTIhTvmsMndSKYBAoGBAKNK\nrrGrfKRy6P50cV8D2r0qfWuUEvL5atXtBHk/R1ynAcueeglR91WKT3yf9F50s6XA\nCN16Z06V1fzJ6y24r0PHo3WZNsqzOG2J4rKrRfu6InXtbnMKjsH4s564U2V8lZVd\npGstQLRH6btqwQSUZ6dOqq3YiP4btEGUkY7WLULBAoGBAKbPhcMQJueHegUq4mQL\nuhj/7w2cFNE/z8HKLf/KtPn1wZj2aGB97r4hVjXhJCXqfA4++H+WERfawRj9bs65\nDQhijuJKrAwF1GaTjqVWpsvV2V/zaBq2hC2Jy4wh62jKcd2LzoXu1o1lpH+HmAOd\nlct2GX0WArV+YW2z8AN1R6ou\n-----END PRIVATE KEY-----\n";
var projectId = "bmsce-flutter";

let allowedGrades = ["S", "A", "B", "C", "D", "E", "F", "I", "X", "W", "PP", "NP"]
function publish(usNs: [number, string][], courses: Course[], data: Object[][], conf: Configuration) {
    function getCourseMarksForUsn(usn: [number, string], course: Course) {
        let grade = data[usn["0"]][course.gradeColIndex].toString()
        if (!allowedGrades.some((value) => { return value == grade })) return null
        let courseDocJson = {}
        let fields = {}
        let fieldPaths = []
        let name = database + "/documents/academic_marks/" + usn[1] + "/" + conf.academicSession + "_" + conf.semesterType + "/" + course.code
        course.fields.forEach((value) => {
            fields[value["1"]] = { "stringValue": data[usn["0"]][value["0"]].toString().trim() }
        })
        course.fields.forEach((value) => { fieldPaths.push(value["1"]) })
        courseDocJson["updateMask"] = { "fieldPaths": fieldPaths }
        courseDocJson["update"] = { "fields": fields, "name": name }
        return courseDocJson
    }
    let studentsNum = usNs.length
    let coursesNum = courses.length
    let writes
    let api = new FirestoreApi("AIzaSyCe0AnvcuVtWai0oH4XZw7wFCjRbTC28AA")
    var errUsns: string[] = []
    for (var i = 0; i < studentsNum; i++) {
        writes = []
        for (var j = 0; j < coursesNum; j++) {
            let courseMarks = getCourseMarksForUsn(usNs[i], courses[j])
            if (courseMarks != null)
                writes.push(courseMarks)
        }
        if (writes.length > 0) {
            var obj = { "writes": writes }
            var response: FirestoreResponse = api.commit(obj)
            if (response.responseCode != 200) {
                errUsns.push(usNs[i][1])
            }
        }

    }


}

function commitToFirestore() {
    var payload =
    {
        "writes":
            [
                {
                    "updateMask":
                    {
                        "fieldPaths":
                            ["cie", "see", "grade"
                            ]
                    },
                    "update":
                    {
                        "fields":
                        {
                            "cie":
                            {
                                "stringValue": "22"
                            },
                            "grade":
                            {
                                "stringValue": "E"
                            },
                            "see":
                            {
                                "stringValue": "22"
                            }
                        },
                        "name": "projects/bmsce-flutter/databases/(default)/documents/academic_marks/1BM14CS083/2014_15_sem_2/14MA1ICMAT"
                    }
                }
            ]
    };
}