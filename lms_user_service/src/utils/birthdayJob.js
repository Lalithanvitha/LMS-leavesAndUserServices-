const cron = require("node-cron");
const { sendBirthdayMails } = require("../utils/mail");
const logger = require("../config/logger");
//for testing purpose time cron is triggering for every minute or else it should be(0 0 * * *) i.e;triggering everyday at 12AM
cron.schedule("0 0 * * *", async () => {
  console.log("Birthday cron file loaded");
  try {
    logger.info("[birthdayjob] :Hitting birthdayjob middleware");
    await sendBirthdayMails();
  } catch (err) {
    logger.error(`Falied to send birthday mail: ${err.message}`);
  }
});
/*
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of Week (0-7)
│ │ │ └──── Month (1-12)
│ │ └────── Day of Month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59) */
