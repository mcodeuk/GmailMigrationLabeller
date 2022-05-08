class UserLabel {
  constructor(id, name) {
    this.id = String(id)
    this.name = String(name)
  }

  CreateLabel() {
    let jdata = {userId: "me",name: this.name}
    Logger.log(`Creating New Label for : ${this.name}`)
    let newlabel = Gmail.Users.Labels.create(jdata, "me")
    this.id = newlabel.id
    Logger.log(`.... new Label Id : ${this.id}`)
  }
}
