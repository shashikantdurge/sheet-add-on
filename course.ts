
//let mat = new Course("14MA1ICMAT","Engg Math 1",4,[[3,"CIE"],[4,"SEE"],[5,"TOTAL"],[6,"GRADE"]])
class Course {
    code: string
    name: string
    credits: number
    fields: [number, string][] //[columnIndex,fieldName]
    gradeColIndex: number
    lastRowIndex: number
    constructor(code: string, name: string, credits: number, fields: [number, string][], lastRowNo) {
        this.code = code
        this.name = name
        this.credits = credits
        this.fields = fields
        this.lastRowIndex = lastRowNo - 1
        fields.forEach((value) => { if (value["1"] == "grade") { this.gradeColIndex = value["0"]; } })
        if (isNaN(this.gradeColIndex)) this.gradeColIndex = -1;
    }
}

//#MARKS_HEADING
var marksHeadingMap = {
    "CIE": "cie",
    "SEE": "see",
    "TOTAL": "total",
    "GRADE": "grade",
    "GRADES": "grade"
}


// @param codeIndex : [row,column] 
//Note: index (in this function) starts with 1, NOT 0
// @param sheet : GoogleAppsScript.Spreadsheet.Sheet
function processCourse(codeIndex: [number, number], sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    let codeRange: GoogleAppsScript.Spreadsheet.Range
    if (sheet.getRange(codeIndex[0], codeIndex[1]).isPartOfMerge())
        codeRange = sheet.getRange(codeIndex[0], codeIndex[1]).getMergedRanges()[0]
    else
        codeRange = sheet.getRange(codeIndex[0], codeIndex[1])


    let nameRange: GoogleAppsScript.Spreadsheet.Range
    if (sheet.getRange(codeRange.getLastRow() + 1, codeIndex[1]).isPartOfMerge())
        nameRange = sheet.getRange(codeRange.getLastRow() + 1, codeIndex[1]).getMergedRanges()[0]
    else
        nameRange = sheet.getRange(codeRange.getLastRow() + 1, codeIndex[1])

    let creditRange: GoogleAppsScript.Spreadsheet.Range
    if (sheet.getRange(nameRange.getLastRow() + 1, codeIndex[1]).isPartOfMerge())
        creditRange = sheet.getRange(nameRange.getLastRow() + 1, codeIndex[1]).getMergedRanges()[0]
    else
        creditRange = sheet.getRange(nameRange.getLastRow() + 1, codeIndex[1])
    //We got codeRange, nameRange and creditRange

    let fieldsRange = sheet.getRange(creditRange.getLastRow() + 1, codeIndex[1], 1, codeRange.getNumColumns())

    validateCourseRange(codeRange, nameRange, creditRange, fieldsRange)

    Logger.log("code %s, name %s, credits %s, fields %s", codeRange.getValue(), nameRange.getValue(), creditRange.getValue(), fieldsRange.getValues())

    var fields: [number, string][] = []
    var fieldsValues = fieldsRange.getValues()[0];
    for (let i = 0; i < fieldsValues.length; i++) {
        fields.push([fieldsRange.getColumn() + i - 1, marksHeadingMap[fieldsValues[i].toString().trim().toUpperCase()]])
    }

    return new Course(codeRange.getValue().toString(), nameRange.getValue().toString(), Number(creditRange.getValue()), fields, fieldsRange.getLastRow())
}

function validateCourseRange(codeRange: GoogleAppsScript.Spreadsheet.Range, nameRange: GoogleAppsScript.Spreadsheet.Range, creditRange: GoogleAppsScript.Spreadsheet.Range, fieldsRange: GoogleAppsScript.Spreadsheet.Range) {

    let noOfColumns = codeRange.getNumColumns()
    if (codeRange.getValue().toString().trim() == "") {
        throw new Error("Course Code cannot be empty, at " + codeRange.getA1Notation());
    }
    if (nameRange.getNumColumns() != noOfColumns) {
        throw new Error("Invalid Format at " + nameRange.getA1Notation())
    }
    if (nameRange.getValue().toString().trim() == "") {
        throw new Error("Course Name cannot be empty, at " + nameRange.getA1Notation());
    }
    if (creditRange.getNumColumns() != noOfColumns) {
        throw new Error("Invalid Format at " + creditRange.getA1Notation())
    }
    if (isNaN(Number(creditRange.getValue()))) {
        throw new Error("Credits should be a Number, at " + creditRange.getA1Notation() + "(" + creditRange.getValue() + ").");
    }
    if (fieldsRange.isPartOfMerge()) {
        throw new Error("Invalid Format at " + fieldsRange.getA1Notation() + " . This Range should not contain merged cells.")
    }
    //#MARKS_HEADING
    var fieldsValues = fieldsRange.getValues()[0];
    let allowedMarksTypes = ["CIE", "SEE", "TOTAL", "GRADE", "GRADES"]
    let fieldsSet = new MySet()
    for (let i = 0; i < fieldsValues.length; i++) {
        if (!allowedMarksTypes.some((value) => { return value == fieldsValues[i].toString().trim().toUpperCase() })) {
            throw new Error("Marks Heading should be one of (CIE,SEE,TOTAL,GRADE), at " + fieldsRange.getA1Notation() + "(" + fieldsValues[i].toString().trim() + ")");
        }
        if (!fieldsSet.has(marksHeadingMap[fieldsValues[i].toString().trim().toUpperCase()])) {
            fieldsSet.add(marksHeadingMap[fieldsValues[i].toString().trim().toUpperCase()]);
        } else {
            throw new Error("Marks Heading should not have Duplicates, at " + fieldsRange.getA1Notation() + "(" + fieldsValues[i].toString().trim() + ")");
        }
    }
    if (!fieldsValues.some((value) => { return marksHeadingMap[value.toString().trim().toUpperCase()] == marksHeadingMap["GRADE"] })) {
        throw new Error("Marks Heading should include 'GRADE', at " + fieldsRange.getA1Notation());
    }
    return true;
}

function getAllCourses() {

}
//isPartOfMerge()	Boolean	Returns true if the cells in the current range overlap any merged cells.