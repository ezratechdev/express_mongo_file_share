'use strict';

const login_tap = document.getElementById('login_tap');
const signup_tap = document.getElementById('signup_tap');

login_tap?.addEventListener('click', () => {
	document.querySelector('.right')?.scrollIntoView({
		behavior: 'smooth',
	});
});

signup_tap?.addEventListener('click', () => {
	document.querySelector('.left')?.scrollIntoView({
		behavior: 'smooth',
	});
});

// forms
const signup_form = document.getElementsByTagName('form')[0]
const login_form = document.getElementsByTagName('form')[1]


// login
signup_form.addEventListener('submit', async event => {
	event.preventDefault();
	const { email, password, confirm_password } = event.target;
	if (password.value == confirm_password.value) {
		// create a modal later
		const body_data = {
			email: email.value,
			password: password.value,
		}
		await fetch('/authenication/signup', {
			method: 'POST',
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			body: body_data ? JSON.stringify(body_data) : undefined,
		})
			.then(data => data.json())
			.then(response => {

				if (response.status == 200) {
					window.location.href = window.location.href;
				} else alert(`${response.message}`);
			})
			.catch((error) => {
				alert(`Could not sign up.Try again later \n ${error}`);
			})
	} else
		alert('Passwords not similar');
});

// login
login_form.addEventListener('submit', async event => {
	event.preventDefault();
	const { email, password } = event.target;
	const body_data = {
		email: email.value,
		password: password.value,
	}
	await fetch('/authenication/login', {
		method: 'POST',
		headers: new Headers({
			'Content-Type': 'application/json',
		}),
		body: body_data ? JSON.stringify(body_data) : undefined,
	})
		.then(data => data.json())
		.then(response => {
			if (response.status == 200) {
				window.location.href = window.location.href;
			} else alert(`${response.message}`);
		})
		.catch((error) => {
			alert('An error occurred.Try again');
		})
});