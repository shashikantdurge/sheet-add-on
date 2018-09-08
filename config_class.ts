class Configuration {
    academicSession: string
    semesterType: string
    resultType: string
    constructor(academicSession: string, semesterType) {
        this.academicSession = academicSession.trim().replace('-', '_')
        this.semesterType = semesterType
    }
}