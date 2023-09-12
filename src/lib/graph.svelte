<script>
	import { onMount } from 'svelte';

	// Exported variable to hold the sections data
	export let sections = [];

	/**
	 * Calculate the angles for each section based on their percentage.
	 * @param {Array} sections - The sections data
	 * @returns {Array} - The sections data with calculated angles
	 */
	function calculateAngles(sections) {
		const totalPercentage = sections.reduce((acc, section) => acc + section.percentage, 0);
		if (totalPercentage !== 100) {
			console.warn('Total percentage does not add up to 100.');
		}
		return sections.map((section) => {
			section.angle = (section.percentage / totalPercentage) * 360 || 0;
			return section;
		});
	}

	let canvas;
	let textCanvas;

	/**
	 * Calculate sections angles and draw the pie chart.
	 */
	function calculateSections() {
		const context = canvas.getContext('2d');
		const textContext = textCanvas.getContext('2d');

		// Calculate center points for both canvases
		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		const textCanvasCenterX = textCanvas.width / 2;
		const textCanvasCenterY = textCanvas.height / 2;
		const textCanvasRadius = textCanvas.width / 2 - 70; // 70 is the offset from the edge

		let startAngle = 0;

		// Calculate angles for sections
		sections = calculateAngles(sections);
		// Draw sections and text
		sections.forEach((section) => {
			const radians = (section.angle * Math.PI) / 180;
			context.beginPath();
			context.moveTo(centerX, centerY);
			context.arc(
				centerX,
				centerY,
				canvas.width / 2,
				(startAngle * Math.PI) / 180,
				radians + (startAngle * Math.PI) / 180
			);
			context.closePath();
			context.fillStyle = section.color;
			context.fill();

			// Text styling
			textContext.fillStyle = 'white';
			textContext.textAlign = 'center';
			textContext.font = "15px 'Inter', sans-serif";

			// Calculate label position
			const middleAngle = startAngle + section.angle / 2;
			const labelX = textCanvasCenterX + textCanvasRadius * Math.cos((middleAngle * Math.PI) / 180);
			const labelY = textCanvasCenterY + textCanvasRadius * Math.sin((middleAngle * Math.PI) / 180);

			// Draw text
			textContext.fillText(`${section.name} (${section.percentage.toFixed(0)}%)`, labelX, labelY);

			startAngle += section.angle;
		});
	}

	onMount(calculateSections);
</script>

<div>
	<canvas bind:this={canvas} id="pie-chart" width="300" height="300" />
	<canvas bind:this={textCanvas} id="text-canvas" width="420" height="420" />
</div>

<style>
	div {
		padding: 2rem;
		max-width: 450px;
	}
	#pie-chart {
		margin: 0px auto;
		width: 300px;
		display: block;
	}
	#text-canvas {
		margin: 0px auto;
		width: 420px;
		display: block;

		position: relative;
		top: -360px;
		left: -60px;
		z-index: 2;
	}
</style>
