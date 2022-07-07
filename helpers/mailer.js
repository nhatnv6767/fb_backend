const nodemailer = require("nodemailer");
const {google} = require("googleapis");

const {OAuth2} = google.auth;
const oauth_link = "https://developers.google.com/oauthplayground";
const {EMAIL, MAILING_ID, MAILING_REFRESH, MAILING_SECRET} = process.env;

const auth = new OAuth2(
    MAILING_ID,
    MAILING_REFRESH,
    MAILING_SECRET,
    oauth_link
);