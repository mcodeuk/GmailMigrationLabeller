# GmailMigrationLabeller

This routine is used to copy the Labels from one GMAIL account to another when messages have been transferred between them using POP.

It uses the Message Id to uniquely identify each message (rfc822msgid) which remains the same between both accounts.

Following Google's announcement that they are closing the Legacy Google Workspace many people will probably be looking for how to migrate their data to save the ongoing running costs.

You may have come across this post https://www.39digits.com/migrate-g-suite-account-to-a-personal-google-account which has been a valuable source of information. 

Unfortunately Google has not make things easy for the Legacy users and so we are having to do the migration ourselves.

A couple of cavets.

* Google does not allow moving messages into SENT so I put them into a new Label called @SENT
* Similarly for DRAFTS I put them into @DRAFTS

All Labels are created at runtime if they do not exist

## Setup

Copy all code to a new Google Script Project at https://script.google.com  

I suggest the breakdown of files just to make it a little easier but it could all be in one file.

(If using the script for multiple users then I would recommend 1 Spreadsheet per user)

Create an Empty Spreadsheet using Google Sheets, use the Browser and get the Id from the URL 

eg https://docs.google.com/spreadsheets/d/ABCDEFGHIJKLMNOPQRSTUVWXYZ/edit#gid=0 the id is ABC...XYZ

If doing multiple accounts then rename the Sheet Name to something meaningful - this saves mistakes!!
(You can create Multiple Sheets one for each account but I recommend 1 Sheet per Account for Privacy reasons)

If you are doing this for someone else then make sure you Share the Spreadsheet with them as Editor

### Script Updates

Make the following changes in the Code file Code.js or Code.gs

1. Line 13 set SCRIPTAUTHOR value to be your email address, this is used so you get notififed when the script has completed.
2. Create a copy of Properties_USERNAME and replace USERNAME with the Name of the user that will be running the script, you may chose to run this for multiple users and it makes it easier for them to run it themselves (this name does not matter it is just for ease of reference)
3. In the new Properties_XXXXXX function you have created make the following changes

* SPREADSHEETID value should be set to the Id of the Spreadsheet created above eg ABC...XYZ
* SHEETNAME value should be set to the Spreadsheet Sheet Name from above eg Sheet1
* SENDERLABEL value - normally this should be all however if you wish to test on a small subset you can set this to a Label used in GMail
* RECEIVERLABEL value - set this to the Label you used when doing the POP import, if you did not set one then use all

Save the script

### Execution

First step is to run the Properties_XXXXXX function on the user that you wish to copy the labels from. This will generate authorisation request and is the bit people will be most scared about so you would need to reassure them!! You need to click all the options like Advanced, Take Me to ... and Allow etc otherise if permissions are not granted the script will not work!

Once the script properties have been set you need to run the RunSender!

Google has execution limits to prevent runaway tasks so the script keeps an eye on itself to see how long it has been running and stops before it gets to the Google limit to ensure that it does not get cancelled. For this reason whether using RunSender or RunReceiver the script will need to be run using a Timed Event Trigger

#### RunSender

RunSender Must be executed on the Sending side, that is the user account that you wish to copy the Labels from!

Run it first to make sure it is working, 

RunSender does a Search of all Mails in the SENDERLABEL and uses a "pagetoken" to move between pages of results.
The pagetoken is saved within the user properties between executiuons so that the script can pick up where it left off following the previous execution

After the 1st run create a Trigger

Select the function RunSender, Deployment : Head, Event Source : Time-driven, Type : Minutes Timer, Minute Interval : 10 minutes

The script will then run every 10 minutes for around 4 minutes.

From a mailbox size of 15,000 messages I found that the script took about 4 hours to gather all of the Labels.

You can see progress by checking the content of the Spreadsheet or viewing the Script execution logs

At the end both the SCRIPTAUTHOR and the current user should get an email advising that the Script has completed and that the Timer can be deleted and a flag is set to prevent further executions (well they get aborted immediately)

#### RunReceiver

The RunReceiver will need to be executed on the Receiving Account, the one that you wish to copy the Labels TO!!!

Go to https://script.google.com on the Receiving Account and run the same Properties_XXXXXX that was run in the previous step.

This will make sure that the receiver is looking at the same Spreadsheet etc.

Now you can manually run RunReceiver and check it is outputting messages correctly.

You may find a number of messages saying not found these are normally associated with TRASH - I might modify the code to prevent them going to Spreadsheet!

Again once you are happy set up a Trigger the same as you did above but for the RunReceiver instead and on the Receiving Account.

Again the script will run every 10 minutes for around 4 minutes.

Similar timing but I found that the RunReceiver takes a bit longer, so for the same number of messages it took around 6 hours.

As each message is processed Column 1 in the Spreadsheet is updated with Yes or Missing to indicate what has been done.


