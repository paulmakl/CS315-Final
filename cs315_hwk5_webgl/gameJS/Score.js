// global score
var score;

function Score(){
	this.paddle1Score = 0;
	this.paddle2Score = 0;

	this.leftDigit1 = 0;
	this.leftDigit2 = 0;

	this.rightDigit1 = 0;
	this.rightDigit2 = 0;

	this.init = function(){
		
	}
}

function ScoreSetup(){
	score = new Score();
	score.init();
}

