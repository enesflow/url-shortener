/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	component$,
	useSignal,
	useStylesScoped$,
	useVisibleTask$,
} from "@builder.io/qwik";
import {
	routeAction$,
	Form,
	type DocumentHead,
	type RequestEvent,
} from "@builder.io/qwik-city";
import STYLES from "./index.css?inline";

export const useCreateURLAction = routeAction$(async (props, requestEvent) => {
	console.log("Using server URL", requestEvent.env.get("SERVER_URL"));
	const url = props.url.toString();
	const short = props.short.toString();
	// check if url is valid using regex
	const urlRegex =
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
	if (!urlRegex.test(url)) {
		return {
			short: "",
			error: "Invalid URL",
		};
	}

	const response = await fetch(
		requestEvent.env.get("SERVER_URL")! + "/create",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: url,
				short: short,
			}),
		}
	);

	const data = await response.json();

	return data as {
		short: string;
		error: string | null;
	};
});

export const useUploadFileAction = routeAction$(async (props, requestEvent) => {
	console.log("Using server URL", requestEvent.env.get("SERVER_URL"));
	const file = props.file as unknown as File;
	if (file.size == 0) {
		return {
			short: "",
			error: "No file selected",
		};
	}
	const short = props.short.toString();

	const formData = new FormData();
	formData.append("file", file);
	formData.append("short", short);

	const response = await fetch(
		requestEvent.env.get("SERVER_URL")! + "/upload",
		{
			method: "POST",
			body: formData,
		}
	);

	const data = await response.json();

	return data as {
		short: string;
		error: string | null;
	};
});

// this is run on the client
export default component$(() => {
	useStylesScoped$(STYLES);

	const createURLAction = useCreateURLAction();
	const uploadFileAction = useUploadFileAction();
	const message = useSignal("");

	useVisibleTask$(({ track }) => {
		track(createURLAction);
		message.value =
			createURLAction.value?.short || createURLAction.value?.error || "";
	});

	useVisibleTask$(({ track }) => {
		track(uploadFileAction);
		message.value =
			uploadFileAction.value?.short ||
			uploadFileAction.value?.error ||
			"";
	});

	useVisibleTask$(() => {
		// make file input p tag clickable
		const fileInput = document.getElementById("file");
		const fileP = document.querySelector("#form > p");
		fileP?.addEventListener("click", () => {
			fileInput?.click();
		});
		// change text of p tag when file is selected
		fileInput?.addEventListener("change", () => {
			fileP!.innerHTML = (fileInput! as HTMLInputElement).files![0].name;
		});
	});

	return (
		<section class="section bright">
			<h1>🔗 URL Shortener 🔗 / 🗂️ File Uploader 🗂️</h1>
			<div class="forms">
				<Form action={createURLAction} id="form">
					<label for="url">Enter URL:</label>
					<input
						type="text"
						name="url"
						id="url"
						placeholder="https://my-awesome.websitse/with?long=url"
					/>
					<span id="shorten_container">
						<input
							type="text"
							name="short"
							id="short"
							placeholder="/short"
						/>
						<button type="submit" id="shorten-btn">
							⚡️
						</button>
					</span>
				</Form>
				<h1>OR</h1>
				<Form action={uploadFileAction} id="form">
					<label for="url">Upload File:</label>
					<p id="choose_file">Choose file</p>
					<input type="file" name="file" id="file" />

					<span id="shorten_container">
						<input
							type="text"
							name="short"
							id="short"
							placeholder="/short"
						/>
						<button type="submit" id="shorten-btn">
							⚡️
						</button>
					</span>
				</Form>
			</div>
			{message.value ? (
				message.value.includes("http") ? (
					<p>
						✅ Your short URL is:{" "}
						<a href={message.value} target="_blank">
							{message.value}
						</a>
					</p>
				) : (
					<p class="capitalize">❌ {message.value}</p>
				)
			) : (
				<p>👆 Enter a URL or upload a file to get a short URL 👆 </p>
			)}
		</section>
	);
});

export const head: DocumentHead = {
	title: "URL Shortener",
	meta: [
		{
			key: "description",
			name: "description",
			content: "URL Shortener",
		},
	],
	links: [
		{
			key: "favicon",
			rel: "icon",
			type: "image/svg+xml",
			href: "/favicon.svg",
		},
	],
};
