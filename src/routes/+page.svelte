<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import questions from '../lib/data/questions.json';
	import ranks from '../lib/data/ranks.json';
	import Graph from '../lib/graph.svelte';
	import {
		trackQuestion,
		trackQuiz,
		getCategoryStats,
		getCompletionStats,
		getQuestionSubmissionCount,
		getQuestionCorrectCount,
		getQuestionStats
	} from '$lib/services.ts'; // adjust the import path as needed

	const PROGRESS_BAR_INCREMENT = 2.2;

	let progressBarInstance;

	let TT_StartTime;
	let TT_Started = false;
	let TT_EndTime;
	let TT_isComplete;
	let TT_Quiz;

	let S_QuestionStats;
	let S_CategoryStats;
	let S_CompletionStats;
	let S_QuestionSubmissionCount;
	let S_QuestionCorrectCount;

	// Initialize state
	const currentQuestionIndex = writable(0);
	const answers = writable([]);
	const results = writable({});
	const sections = ['JavaScript', 'HTML5', 'Accessibility', 'OpenID'];
	let pieSections = [];

	// Helper functions
	function stringToHex(str) {
		return [...str].map((char) => char.charCodeAt(0).toString(16)).join('');
	}

	function randomHSL() {
		const hue = Math.floor(Math.random() * 360);
		return `hsl(${hue}, 80%, 20%)`;
	}

	function updateProgressBar() {
		if (progressBarInstance) {
			progressBarInstance.progress =
				($currentQuestionIndex * PROGRESS_BAR_INCREMENT) / (questions.length + 1);
		}
	}

	// Group questions by category
	const groupedQuestions = {};
	questions.forEach((question) => {
		if (!groupedQuestions[question.category]) {
			groupedQuestions[question.category] = [];
		}
		groupedQuestions[question.category].push(question);
	});

	// Randomize questions within each category
	Object.keys(groupedQuestions).forEach((category) => {
		groupedQuestions[category].sort(() => Math.random() - 0.5);
	});

	console.log(groupedQuestions);

	// Concatenate randomized chunks to form the final list of questions
	const randomizedQuestions = sections.flatMap((category) => groupedQuestions[category]);

	function getProgressBarInstance() {
		try {
			let instance = mdc.linearProgress.MDCLinearProgress.attachTo(
				document.querySelector('.mdc-linear-progress')
			);
			console.log(instance);
			return instance;
		} catch (error) {
			console.log(error);
		}
		// return MDCLinearProgressInstance.foundation;
	}

	function answerQuestion(answer) {
		$answers.push(stringToHex(answer));
		if (!TT_Started) {
			TT_StartTime = new Date().toISOString();
			TT_Started = true;
		}
		trackQuestion(fetch, urlEncode(base64encode(answer)), answer, true);

		if ($currentQuestionIndex < questions.length - 1) {
			$currentQuestionIndex++;
			updateProgressBar();
		} else {
			updateProgressBar();
			calculateResults();
			currentQuestionIndex.set(questions.length);
			TT_isComplete = true;
			trackQuiz(fetch, TT_StartTime, TT_EndTime, TT_isComplete, TT_Quiz);
		}

		// getProgressBarInstance().setBuffer(questions.length);
	}

	function getRandomRankByPercentage(percentage, ranks) {
		const defaultRank = 'No Rank Found';

		let matchedRanks = ranks.filter((rank) => {
			const range = rank.percentageRange.split('-');
			// console.log(range[0], range[1]);
			return percentage >= range[0] && percentage <= range[1];
		});

		console.log(matchedRanks);
		if (matchedRanks.length > 0) {
			// If multiple ranks match, randomly select one
			const randomIndex = Math.floor(Math.random() * matchedRanks.length);
			return matchedRanks[randomIndex].rank;
		} else {
			// If no rank matches, return the default rank
			return defaultRank;
		}
	}

	function randomizeAnswers() {
		for (let i = 0; i < questions.length; i++) {
			const randomIndex = Math.floor(Math.random() * questions[i].options.length);
			const randomAnswer = questions[i].options[randomIndex];
			const randomAnswerHex = stringToHex(randomAnswer);
			$answers.push(randomAnswerHex);
		}
		calculateResults();
		currentQuestionIndex.set(questions.length);
	}
	let selectedRank;
	async function calculateResults() {
		const categories = {};
		questions.forEach((question, index) => {
			const category = question.category;
			if (!categories[category]) {
				categories[category] = { correct: 0, total: 0 };
			}
			categories[category].total++;
			if (question.correctAnswer === $answers[index]) {
				categories[category].correct++;
			}
		});
		results.set(categories);
		let percentage = 0;
		let percentageCount = 0;
		let percentageCountCorrent = 0;
		//calculate percentage from each entry in results adding total correct and total questions to get total percentage
		Object.keys(categories).forEach((category) => {
			percentageCountCorrent += categories[category].correct;
			percentageCount += categories[category].total;
		});
		percentage = (percentageCountCorrent + 10) / percentageCount;
		TT_Quiz = urlEncode(base64encode($answers));
		TT_isComplete = true;
		TT_EndTime = new Date().toISOString();

		pieSections = Object.keys(categories).map((category) => {
			return {
				name: category,
				percentage: (categories[category].correct / categories[category].total) * 100,
				// color: '#' + Math.floor(Math.random() * 16777215).toString(16)
				color: randomHSL()
			};
		});

		selectedRank = getRandomRankByPercentage(Number(percentage * 100).toFixed(0), ranks);
		// S_QuestionStats = await getQuestionStats(window.fetch);
		// S_CategoryStats = await getCategoryStats(window.fetch);
		// S_CompletionStats = await getCompletionStats(window.fetch);
		// S_QuestionSubmissionCount = await getQuestionSubmissionCount(window.fetch, 'encodedTextHere');
		// S_QuestionCorrectCount = await getQuestionCorrectCount(window.fetch, 'encodedTextHere');
	}

	function resetQuiz() {
		answers.set([]);
		results.set({});
		currentQuestionIndex.set(0);
	}

	function handleKeydown(event) {
		if ($currentQuestionIndex < questions.length) {
			const key = event.key;
			if (['1', '2', '3', '4'].includes(key)) {
				const index = parseInt(key, 10) - 1;
				answerQuestion(questions[$currentQuestionIndex].options[index]);
			}
		}
	}

	function urlEncode(str) {
		return encodeURIComponent(str).replace(/%20/g, '+');
	}

	function base64encode(str) {
		return btoa(str);
	}

	onMount(async () => {
		// const questionData = await trackQuestion(fetch, 'encodedTextHere', 'option1', true);
		// const stats = await getQuestionStats(fetch);

		progressBarInstance = mdc.linearProgress.MDCLinearProgress.attachTo(
			document.querySelector('.mdc-linear-progress')
		);
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	export let data;
</script>

<svelte:head>
	<!-- ... other head elements ... -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/material-components-web@latest/dist/material-components-web.min.css"
	/>
	<script
		defer
		src="https://cdn.jsdelivr.net/npm/material-components-web@latest/dist/material-components-web.min.js"
	></script>
</svelte:head>
<div class="top-bar">
	<div class="mdc-typography--headline4">IKM Skills Test</div>
	<!-- <div class="mdc-typography--headline6">
		Question {$currentQuestionIndex + 1} / {questions.length}
	</div>
	<div class="mdc-typography--headline6">{$answers.length} / {questions.length}</div> -->
	<div
		style="position:relative;top:13px;"
		role="progressbar"
		class="mdc-linear-progress"
		aria-label="Example Progress Bar"
		aria-valuemin="0"
		aria-valuemax="1"
		aria-valuenow="0"
	>
		<div class="mdc-linear-progress__buffer">
			<div class="mdc-linear-progress__buffer-bar" />
			<div class="mdc-linear-progress__buffer-dots" />
		</div>
		<div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
			<span class="mdc-linear-progress__bar-inner" />
		</div>
		<div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
			<span class="mdc-linear-progress__bar-inner" />
		</div>
	</div>
</div>

{#if $currentQuestionIndex < questions.length}
	{#if questions[$currentQuestionIndex].didYouKnow}
		<div class="mdc-card firstBit" style="width:50%;padding:1rem;box-shadow:none;">
			{#if $currentQuestionIndex == 0}
				<h2 class="mdc-typography--headline3">
					{questions[$currentQuestionIndex].didYouKnow?.title}
				</h2>
			{:else if $currentQuestionIndex == 1}
				<span>
					<br />
					<br />
					<h2 class="mdc-typography--headline6">
						{questions[questions.length - 1].didYouKnow?.title}
					</h2>
				</span>
			{:else}
				<br />
				<br />
				<h2 class="mdc-typography--headline6">
					{questions[$currentQuestionIndex - 1].didYouKnow?.title}
				</h2>
			{/if}

			{#if $currentQuestionIndex == 0}
				<p class="mdc-typography--headline7">
					{questions[$currentQuestionIndex].didYouKnow?.paragraph}
				</p>
			{:else if $currentQuestionIndex == 1}
				<p>{questions[questions.length - 1].didYouKnow?.paragraph}</p>
			{:else}
				<p>{questions[$currentQuestionIndex - 1].didYouKnow?.paragraph}</p>
			{/if}
		</div>
	{/if}

	<div class="mdc-card" style="box-shadow:none;">
		<!-- <h2 class="mdc-typography--headline6">{questions[$currentQuestionIndex].category}</h2> -->
		<h2 class="mdc-typography--headline5">
			{questions[$currentQuestionIndex].questionText}
		</h2>
		<div class="mdc-list">
			{#each questions[$currentQuestionIndex].options as option, index}
				<button class="mdc-button mdc-button--raised" on:click={() => answerQuestion(option)}>
					{option}
				</button>
			{/each}
		</div>
	</div>
{:else}
	<div class="mdc-card" style="padding-top:200px;">
		<h2 class="mdc-typography--headline5">Results</h2>
		<div class="mdc-list">
			{#each Object.keys($results) as category}
				<div class="mdc-list-item">
					<span class="mdc-typography--body1"
						><strong>{category}</strong>: {$results[category].correct} / {$results[category]
							.total}</span
					>
				</div>
			{/each}
		</div>
		<Graph sections={pieSections} />

		<span style="position:relative;top:-350px;left:0;">
			{selectedRank}
		</span>
		<!-- <span style="position:relative;top:-350px;left:0;">
			QuestionStats<br /><span> {JSON.stringify(S_QuestionStats, null, 2)} </span><br /><br />
			CategoryStats<br /><span> {JSON.stringify(S_CategoryStats)} </span><br /><br />
			CompletionStats<br /><span> {JSON.stringify(S_CompletionStats)} </span><br /><br />
			QuestionSubmissionCount<br /><span> {JSON.stringify(S_QuestionSubmissionCount)} </span><br
			/><br />
			QuestionCorrectCount<br /><span> {JSON.stringify(S_QuestionCorrectCount)} </span><br /><br />
		</span> -->
	</div>
{/if}

{#if $currentQuestionIndex > 0}
	<div class="section-list">
		{#each sections as section, index}
			<span
				class="section-item {section === questions[$currentQuestionIndex]?.category
					? 'current'
					: ''}"
			>
				{section}
			</span>
		{/each}
	</div>
{/if}

<div class="status-bar">
	<button class="mdc-button mdc-button--outlined" on:click={resetQuiz}>Reset</button>
	<button class="mdc-button mdc-button--outlined" on:click={randomizeAnswers}
		>Randomize Answers</button
	>
</div>

<style>
	/* hide on mobile */
	@media (max-width: 768px) {
		.firstBit {
			display: none;
		}
	}
</style>
