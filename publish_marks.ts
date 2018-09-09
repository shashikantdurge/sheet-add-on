let database = "projects/bmsce-flutter/databases/(default)"

let allowedGrades = ["S", "A", "B", "C", "D", "E", "F", "I", "X", "W", "PP", "NP"]
function publish(usNs: [number, string][], courses: Course[], data: Object[][], conf: Configuration) {
    function getCourseMarksForUsn(usn: [number, string], course: Course) {
        let grade = data[usn[0]][course.gradeColIndex].toString()
        if (!allowedGrades.some((value) => { return value == grade })) return null
        let courseDocJson = {}
        let fields = {}
        let fieldPaths = []
        let name = database + "/documents/academic_marks/" + usn[1] + "/" + conf.academicSession + "_" + conf.semesterType + "/" + course.code
        course.fields.forEach((value) => {
            fields[value[1]] = { "stringValue": data[usn[0]][value[0]].toString().trim() }
        })
        course.fields.forEach((value) => { fieldPaths.push(value[1]) })
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