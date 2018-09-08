var exports = exports || {};
var module = module || { exports: exports };
function onOpen(e) {
    SpreadsheetApp.getUi().createAddonMenu()
        .addItem('CIE & SEE', 'showSidebar')
        .addToUi();
}
function onInstall(e) {
    onOpen(e);
}
function showSidebar() {
    var sideBarUi = HtmlService.createHtmlOutputFromFile('sidebar')
        .setTitle('CIE & SEE');
    SpreadsheetApp.getUi().showSidebar(sideBarUi);
}

function configureAndPublish(){
  var confUi = HtmlService.createHtmlOutputFromFile('configuration')
  SpreadsheetApp.getUi().showModalDialog(confUi,"Configure & Publish")
}

function getUsnsAndCourses() {
    var coursesProperty = PropertiesService.getDocumentProperties().getProperty("COURSES_IN_EFFECT")
    try{
      console.log(JSON.parse(coursesProperty))
    }catch(err){
      console.error(err+". Could not parse courses "+coursesProperty)
    }
    
    var sheet = SpreadsheetApp.getActiveSheet();
    var data2DArr = sheet.getDataRange().getValues();
    var courses = [];
    var usNs = []; //[rowIndex, USN]
    var codeRegex = new RegExp('[0-9]{2}[A-Z]{2}[0-9][A-Z]{2}[0-9A-Z]{3}', 'gi');
    var firstCodeIndices = findFirstMatch(codeRegex);
    if (firstCodeIndices[0] == -1) {
        Logger.log("No matchng Code");
        throw Error("Course Code NOT found");
    }
    var usnRegex = new RegExp('1BM[0-9]{2}[A-Z]{2}[0-9]{3}', 'gi');
    var firstUsnIndices = findFirstMatch(usnRegex);
    if (firstUsnIndices[0] == -1) {
        Logger.log("No matchng Code");
        throw Error("USN NOT found");
    }
    var usnColIndex = firstUsnIndices[1];
    var codeRowIndex = firstCodeIndices[0];
    var codeColIndex = firstCodeIndices[1];
    do {
        var course = processCourse([codeRowIndex + 1, codeColIndex + 1], sheet);
        courses.push(course);
        codeColIndex = course.fields[course.fields.length - 1][0] + 1;
    } while (data2DArr[codeRowIndex][codeColIndex] != undefined && data2DArr[codeRowIndex][codeColIndex].toString().match(codeRegex));
    //USN should be down-below the first course
    if (firstUsnIndices[0] <= (courses[0].lastRowIndex) || usnColIndex >= firstCodeIndices[1]) {
        var range = sheet.getRange(firstUsnIndices[0] + 1, usnColIndex + 1);
        throw Error("USN should be LEFT-DOWN side of Course, at " + range.getA1Notation());
    }
    for (var i = firstUsnIndices[0]; i < data2DArr.length; i++) {
        var usn = data2DArr[i][usnColIndex].toString().trim().toUpperCase();
        if (usn.match(usnRegex))
            usNs.push([i, usn]);
        else
            break;
    }
    Logger.log(courses);
    Logger.log(usNs);
    console.info("Courses %s", courses)
    console.info("USNs %s", usNs)
    PropertiesService.getDocumentProperties().setProperty("COURSES_IN_EFFECT",JSON.stringify(courses))
    return [courses,usNs]
}
//returns [i,j] . i=row j=column if found. [-1] otherwise.
function findFirstMatch(regexp) {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data2DArr = sheet.getDataRange().getValues();
    for (var i = 0; i < data2DArr.length; i++) {
        for (var j = 0; j < data2DArr[i].length; j++) {
            if (data2DArr[i][j] != undefined && data2DArr[i][j].toString().match(regexp)) {
                Logger.log("%s Found in column %s, row %s", data2DArr[i][j], j, i);
                return [i, j];
            }
        }
    }
    return [-1];
}
