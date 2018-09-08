function testFunct() {
    var usNsAndCourses = getUsnsAndCourses()
    var data2DArr = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
    var conf = new Configuration("2014-15", "sem_1")
    publish(usNsAndCourses[1], usNsAndCourses[0], data2DArr, conf)
}