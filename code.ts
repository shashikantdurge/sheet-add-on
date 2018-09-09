


var exports = exports || {};
var module = module || { exports: exports };
const COURSES_IN_EFFECT = "COURSES_IN_EFFECT"
const USNS_IN_EFFECT = "USNS_IN_EFFECT"
const DATA_IN_EFFECT = "DATA_IN_EFFECT"
const SHEET_IN_EFFECT = "SHEET_IN_EFFECT"
const SHEET_URL = "SHEET_URL"
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

function configure() {
    var properties = PropertiesService.getDocumentProperties()
    var sheetUrl = properties.getProperty(SHEET_URL)
    if (sheetUrl != null && /PUBLISHING/.test(properties.getProperty(sheetUrl))) {
        throw Error(properties.getProperty(sheetUrl))
    }
    var confUi = HtmlService.createHtmlOutputFromFile('configuration').setWidth(250)
        .setHeight(250);
    SpreadsheetApp.getUi().showModalDialog(confUi, "Configure & Publish")
}

function getUsnsAndCourses() {
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
    PropertiesService.getDocumentProperties().setProperty(COURSES_IN_EFFECT, JSON.stringify(courses))
    PropertiesService.getDocumentProperties().setProperty(USNS_IN_EFFECT, JSON.stringify(usNs))
    //PropertiesService.getDocumentProperties().setProperty(DATA_IN_EFFECT, JSON.stringify(data2DArr))
    PropertiesService.getDocumentProperties().setProperty(SHEET_IN_EFFECT, sheet.getName())
    PropertiesService.getDocumentProperties().setProperty(SHEET_URL, SpreadsheetApp.getActive().getUrl())
    return [courses, usNs]
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


function validateAndPublish(academicSession: string, semesterType: string) {

    var properties = PropertiesService.getDocumentProperties()
    var courses = JSON.parse(properties.getProperty(COURSES_IN_EFFECT))
    var usNs = JSON.parse(properties.getProperty(USNS_IN_EFFECT))
    // var data = JSON.parse(properties.getProperty(DATA_IN_EFFECT))
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(properties.getProperty(SHEET_IN_EFFECT))
    var sheetUrl = properties.getProperty(SHEET_URL)
    var conf = new Configuration(academicSession, semesterType)
    if (courses == null || usNs == null || sheet == null) {
        throw Error("PUBLISH FAILED. Refresh and try again.")
    }
    var data = sheet.getDataRange().getValues()
    try {
        properties.setProperty(sheetUrl, "PUBLISHING, Please wait. Started at " + (new Date().toLocaleString()))
        publish(usNs, courses, data, conf)
        properties.setProperty(sheetUrl, "PUBLISH SUCCESSFUL at " + (new Date().toLocaleString()))
    } catch (err) {
        properties.setProperty(sheetUrl, "PUBLISH FAILED. Refresh and try again.")
    }
    SpreadsheetApp.getUi().alert('Publish status :' + properties.getProperty(SHEET_IN_EFFECT), properties.getProperty(sheetUrl), SpreadsheetApp.getUi().ButtonSet.OK)
    return properties.getProperty(sheetUrl)
}
