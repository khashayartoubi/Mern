import * as nodemailer from "nodemailer";
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;

const {
	EMAIL,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REFRESH_TOKEN,
	OAUTH_LINK,
} = process.env;

const auth = new OAuth2(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REFRESH_TOKEN,
	OAUTH_LINK
); // athentication

export const sendVerificationEmail = (email, name, url) => {
	auth.setCredentials({
		refresh_token: GOOGLE_REFRESH_TOKEN,
	});

	const accessToken = auth.getAccessToken();
	var stmp = nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: EMAIL,
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			accessToken,
			refreshToken: GOOGLE_REFRESH_TOKEN,
		},
	});

	const mailOptions = {
		from: EMAIL,
		to: email,
		subject: "facebook gmail verification",
		html: `
        <div>${name} </div>
		<a href=${url}>click for activate your account nidoweb</a>  
        `,
	};
	stmp.sendMail(mailOptions, (err, res) => {
		if (err) return err;
		return res;
	});
};

export const sendResetPassword = (email, name, code) => {
	auth.setCredentials({
		refresh_token: GOOGLE_REFRESH_TOKEN,
	});

	const accessToken = auth.getAccessToken();
	var stmp = nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: EMAIL,
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			accessToken,
			refreshToken: GOOGLE_REFRESH_TOKEN,
		},
	});

	const mailOptions = {
		from: EMAIL,
		to: email,
		subject: "facebook mern reset code",
		html: `
        <div>${code} </div>
        `,
	};
	stmp.sendMail(mailOptions, (err, res) => {
		if (err) return err;
		return res;
	});
};

