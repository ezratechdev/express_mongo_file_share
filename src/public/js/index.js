'use strict';

const openModalButtons = document.querySelectorAll('.open-modal'),
	modal = document.querySelector('.modal'),
	closeModalButtons = document.querySelectorAll('.close-modal');

openModalButtons.forEach(openBtn => {
	openBtn.addEventListener('click', openModal)
});

closeModalButtons.forEach(closeBtn => {
	closeBtn.addEventListener('click', closeModal)
});

function openModal() {
	modal.classList.add('visible');
}

function closeModal() {
	modal.classList.remove('visible');
}
// get form  
const file_sender = document.getElementById('file_sender');


// files holder
const files_body = document.getElementById(`files_body`);
// sockets
const socket = io();

socket.emit('data', 'from front end');


// random name generator





file_sender?.addEventListener('submit', async event => {
	event.preventDefault();
	const { file } = event.target;
	// text || file should be present before upload
	console.log(file);
	const form_data = new FormData();
	form_data.set('file', file.files[0]);

	// reset form if everything goes well
	await fetch('/files/', {
		method: 'POST',
		headers: new Headers({
			// 'Content-Type':'application/json',
		}),
		body: form_data,
	})
		.then(data => data.json())
		.then(result => {
			console.log(result)
		})
		.catch(error => {
			console.log(error);
		});
	event.target?.reset();
});

// get user files 
const get_files = async () => {
	await fetch(`/files/`,
		{
			method: 'GET',
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
		})
		.then(data => data.json())
		.then(response => {
			console.log(response);
			// document.getElementById(`files_body`).innerHTML = document.createElement(`li`).innerHTML = `No Files`;
			if (response.status == 200) {
				response.files.forEach(({ download, name, locked, short_id }, index) => {
					li_creator({
						name,
						short_id,
						download,
						locked,
					})
				})
			} else {
				alert(response.message);
			}
		})
		.catch(error => {
			console.log(error);
		});
}

const network_service = async ({ path, method, body }) => {
	await fetch(`${path}`, {
		method,
		headers: new Headers({
			'Content-Type': 'application/json',
		}),
		body: body ? JSON.stringify(body) : undefined,
		credentials: 'same-origin',
	})
		.then(data => data.json())
		.then(response => {
			if (response.status == 200) {
				alert(`Action taken`);
			} else {
				// someone kindly create a modal for displaying errors
				alert(`${response.message}`);
			}
		})
}

// download buffer file
const download_file = async (id) => {
	await fetch(`/files/dowload/${id}`, {
		method: `GET`,
		headers: new Headers({
			'Content-Type': 'application/json',
		}),
		credentials: 'same-origin',
	})
		.then((response) => {
			console.log(response);
			alert(`File downloaded`);
		})
		.catch(error => {
			console.log(error);
		})
}


// li item creator 
const li_creator = ({ name, short_id, download, locked }) => {
	// returns a li --- appended by the looper
	// create parent
	const li = document.createElement(`li`);
	// 1st div
	const div_one = document.createElement(`div`);
	div_one.classList.add(`type`);
	const i = document.createElement(`i`);
	i.classList.add(`fa-solid`);
	// 2nd div
	const div_two = document.createElement(`div`);
	div_two.classList.add(`name`);
	div_two.innerHTML = `${name} ${download} downloads`
	// 3rd div
	const div_three = document.createElement(`div`)
	div_three.classList.add('options');
	const create_button = ({ text, func }) => {
		const new_button = document.createElement('button');
		new_button.classList.add('options_btn');
		new_button.innerHTML = `${text}`;
		new_button.addEventListener('click', () => func());
		return new_button;
	}
	// for download return type is a buffer file
	const btn1 = create_button({
		text: `Download`, func: () => download_file(short_id),
	});
	const btn2 = create_button({
		text: `${locked ? "Hide" : "Unhide"}`, func: () => network_service({
			path: `/files/${locked ? "unlock" : "lock"}/${short_id}`,
			// can also be unlock depending on lock status
			method: `PATCH`,
			body: undefined,
		})
	});
	const btn3 = create_button({
		text: `Delete`, func: () => network_service({
			path: `/files/${short_id}`,
			method: `DELETE`,
			body: undefined,
		})
	});
	div_three.appendChild(btn1);
	div_three.appendChild(btn2);
	div_three.appendChild(btn3);
	// append to parent
	li.appendChild(div_one);
	li.appendChild(div_two);
	li.appendChild(div_three);
	files_body?.appendChild(li);
}




get_files();