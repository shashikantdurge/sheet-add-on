class Configuration {
    static MAKE_UP: string = "make_up"
    static MAIN: string = "main"
    static COURSE_NAME = "courseName"
    static CREDITS = "credits"

    academicSession: string
    semesterType: string
    valuationType: string
    isMakeUp: boolean
    constructor(academicSession: string, semesterType: string, valuationType: string, isMakeUp: boolean) {
        this.academicSession = academicSession.trim().replace('-', '_')
        this.semesterType = semesterType
        this.valuationType = valuationType
        this.isMakeUp = isMakeUp
    }

}