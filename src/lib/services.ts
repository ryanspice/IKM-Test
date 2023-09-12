// Define the base URL for the API
const BASE_URL = "https://ryanspice.com/tests/ikmstest/track-ikmstest.php?type=";

// Function to track a question
export async function trackQuestion(fetch: typeof window.fetch, encoded_question_text: string, selected_answer: string, is_correct: boolean) {
	const url = `${BASE_URL}trackQuestion&encoded_question_text=${encoded_question_text}&selected_answer=${selected_answer}&is_correct=${is_correct}`;
	const response = await fetch(url);
	return response.json();
}

// Function to track a quiz
export async function trackQuiz(fetch: typeof window.fetch, start_time: string, end_time: string, is_completed: boolean, encoded_answers: string) {
	const url = `${BASE_URL}trackQuiz&start_time=${start_time}&end_time=${end_time}&is_completed=${is_completed}&encoded_answers=${encoded_answers}`;
	const response = await fetch(url);
	return response.json();
}

// Function to get question stats
export async function getQuestionStats(fetch: typeof window.fetch) {
	const url = `${BASE_URL}getQuestionStats`;
	const response = await fetch(url);
	return response.json();
}

// Function to get category stats
export async function getCategoryStats(fetch: typeof window.fetch) {
	const url = `${BASE_URL}getCategoryStats`;
	const response = await fetch(url);
	return response.json();
}

// Function to get completion stats
export async function getCompletionStats(fetch: typeof window.fetch) {
	const url = `${BASE_URL}getCompletionStats`;
	const response = await fetch(url);
	return response.json();
}

// Function to get question submission count
export async function getQuestionSubmissionCount(fetch: typeof window.fetch, encoded_question_text: string) {
	const url = `${BASE_URL}getQuestionSubmissionCount&encoded_question_text=${encoded_question_text}`;
	const response = await fetch(url);
	return response.json();
}

// Function to get question correct count
export async function getQuestionCorrectCount(fetch: typeof window.fetch, encoded_question_text: string) {
	const url = `${BASE_URL}getQuestionCorrectCount&encoded_question_text=${encoded_question_text}`;
	const response = await fetch(url);
	return response.json();
}
