class HandleSheet {
  constructor() {
    this.columncount = 5
    this.sheet = SpreadsheetApp.openById(userproperties.spreadsheetid).getSheetByName(userproperties.sheetname)
    let lastcolumn = this.sheet.getLastColumn()
    let lastrow = this.sheet.getLastRow()
    if (lastrow == 0 || lastcolumn == 0) {
      this.sheet.appendRow(["Processed","Subject", "ReadState", "LabelList", "MessageId",])
    }
    this.datarange = null
  }

  LastRow() {
    return this.sheet.getLastRow()
  }

  AddMessageData(msgdata) {
    let row = ["",msgdata.subject, msgdata.readstate, msgdata.labelnames.join(","), msgdata.globalmsgid]
    this.sheet.appendRow(row)
  }


  MarkMessageAsProcessed(msgdata) {
    this.sheet.getRange(msgdata.rowid,1,1,1).setValue(msgdata.processed)
  }

  GetMessageDataRows() {
    let lastrow = this.sheet.getLastRow()
    let messages = []
    Logger.log(`Spreadsheet has ${lastrow} rows`)
    if (lastrow > 1) {
      let datarange = this.sheet.getRange(2,1,lastrow - 1,this.columncount)
      let rownum = 1
      datarange.getValues().forEach(datarow => {
        rownum += 1
        let msg = new MessageData("")
        msg.processed = datarow[0]
        msg.subject = datarow[1]
        msg.readstate = datarow[2]
        msg.labelnames = datarow[3].toString().split(",")
        msg.globalmsgid = datarow[4]
        msg.rowid = rownum
        if (msg.processed == "" && msg.globalmsgid != null && msg.globalmsgid != "") {
          messages.push(msg)
        }
        let newlabels = []
        msg.labelnames.forEach(labelname => {
          if (ADJUSTLABELS.includes(labelname)) {
            newlabels.push(`@${labelname}`)
          }
          else {
            newlabels.push(labelname)
          }
        })
        msg.labelnames = newlabels
      })
    }
    return messages
  }
}
