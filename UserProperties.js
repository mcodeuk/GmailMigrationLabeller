class UserPropertis {
  constructor() {
    let props = PropertiesService.getUserProperties()
    this.spreadsheetid = ""
    this.sheetname = ""
    this.lock = LockService.getScriptLock()
    this.senderlabel = ""
    this.receiverlabel = ""
    this.propertiesOK = false

    props.getKeys().forEach(key => {
      let value = props.getProperty(key)
      switch (key) {
        case SPREADSHEETID:
          this.spreadsheetid = value
          break
        case SHEETNAME:
          this.sheetname = value
          break
        case RECEIVERLABEL:
          this.receiverlabel = value
          break
        case SENDERLABEL:
          this.senderlabel = value
          break
      }
    })
    if (this.spreadsheetid != "" && this.sheetname != "" && this.senderlabel != "" && this.receiverlabel != "") {
      this.propertiesOK = true
    }
  }

  CheckLock() {
    return this.lock.hasLock()
  }

  LockScript(timeout) {
    if (this.CheckLock()) {
      Logger.log("Already have the Lock")
      return true
    }
    this.lock = LockService.getScriptLock()
    var success = this.lock.tryLock(timeout)
    return success
  }

  GetFinal() {
    let final = PropertiesService.getUserProperties().getProperty(FINAL)
    if (final == null || final == "NO") {
      return false
    }
    return true
  }

  SetFinal(state) {
    if (state) {
      PropertiesService.getUserProperties().setProperty(FINAL, "YES")
      let body = [
        "Email Sync Complete - Reached End of MailBox",
        `Spreadsheet Tab : ${this.sheetname}`,
        "Please deactivate the timer"
      ].join("\n")
      var currentuser = Session.getActiveUser().getEmail()
      GmailApp.sendEmail(currentuser,"Email Sync",body)
      GmailApp.sendEmail(SCRIPTAUTHOR,"Email Sync for : " + currentuser,body)
    }
    else {
      PropertiesService.getUserProperties().deleteProperty(FINAL)
    }
  }
  GetPageToken() {
    let token = PropertiesService.getUserProperties().getProperty(PAGETOKEN)
    Logger.log(`Page Token Retrieved as : ${token}`)
    return token
  }
  
  SavePageToken(token) {
    if (token == null) {
      PropertiesService.getUserProperties().deleteProperty(PAGETOKEN)
    }
    else {
      PropertiesService.getUserProperties().setProperty(PAGETOKEN, token)
    }
    Logger.log(`Page Token Saved as : ${token}`)
  }

  UnlockScript() {
    this.lock.releaseLock()
  }
  
  ShowUserScriptProperties() {
    let props = PropertiesService.getUserProperties().getProperties()
    
    Object.keys(props).forEach(key => {
      let value = props[key]
      Logger.log(`Script Property : ${key} has value ${value}`)
    })
  }
}

let userproperties = new UserPropertis()
