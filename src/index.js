import React from 'react';
import ReactDOM from 'react-dom';
import DialogInput from 'react-native-dialog-input';
import './index.css';

//changed from class to function b/c it only returns a render 
function Square(props) {
    let is_win = (props.winMove) ? 'red' : '';
    const mystyle = {
        backgroundColor: is_win,
    }; 
    return (
        <button className="square" onClick={props.onClick} style={mystyle}>
            {props.value}
        </button>
    );
}

//Board Component
class Board extends React.Component {
    renderSquare(i) {
        let is_winMove = (i === this.props.winMove) ? true : false;
        return (
            <Square 
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)} //passing state from the Board
                winMove={is_winMove}
            />
        ); 
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

//Game Component
class Game extends React.Component {
    constructor(props) {
        super(props);   //super constructor for React Components
        this.state = {   
            history: [{ //stores all states of the game 
                squares: Array(9).fill(null),   //initial state of the game
                move: null, 
            }], 
            stepNumber: 0, //record game state #
            xIsNext: true, //tract who's turn it is
            winMove: null,
            is_reversed: false, 
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1); //holds all game states so far
        const current = history[history.length - 1]; //holds current game state
        const squares = current.squares.slice();    //copy of current game state 
        if (calculateWinner(squares) || squares[i]) {   //if there's a winner or square already filled, don't do anything
            return;
        }   
        squares[i] = this.state.xIsNext ? 'X' : 'O';    //which player
        let is_win = calculateWinner(squares) ? i : null;

        this.setState({
            history: history.concat([{      //add current game state to history
                squares: squares,
                move: i,           
            }]),
            stepNumber: history.length,     //step number = how long history is
            xIsNext: !this.state.xIsNext,   //updates who's next
            winMove: is_win,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            winMove: null,
        });
    }

    reverseList() {
        this.setState({
            is_reversed: !this.state.is_reversed,
        });
    }

    reverseButton() {
        return (
            <button onClick={ () => this.reverseList()}
                className="reverse_button"
            >
                Reverse History
            </button>
        );
    }
    
    gridSize() {
        return (
            <DialogInput isDialogVisible={this.state.isDialogVisible}
                title={"Grid Size"}
                message={"Enter Amount of Rows & Columns"}
                submitInput={ (inputText) => {this.sendInput(inputText)} }
                closeDialog={ () => {this.showDialog(false)}}>
            </DialogInput>
        );
    }

    render() {
        const history = this.state.history; //holds previous and current game states
        const current = history[this.state.stepNumber];    //current game states 
        const winner = calculateWinner(current.squares);    //checks if there's a winner 
        
        //maps elements to history array elements
        const moves = history.map((step, move) => { // (current element, current index)
            let coord = '';

            if (step.move !== null) {
                let row = parseInt(step.move/3) + 1;
                let column = step.move % 3 + 1;
                coord += ' (' + row + ', ' + column + ')';
            }

            const desc = move ? 
                'Go to move #' + move + coord : //move number 
                'Go to game start'; //no moves so far

            const bold = {fontWeight: 'bold',};

            return (    //each move creates a button of previous game states to jump to 
                    //key used for REACT to determine ordering of list when re-rendered
                    //can't use "this.state.key"
                <li key={move}>    
                    <button onClick={() => this.jumpTo(move) }>{desc}</button>
                </li>
            );
        });
        
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            if (this.state.stepNumber === 9) {
                status = 'Draw';
            } else {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }
        }

        const mystyle = (this.state.is_reversed) ? 
        {
            display: 'flex',
            flexDirection: 'column-reverse',
        } : {} ;


        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares={current.squares}  //render current game state 
                        onClick={(i) => this.handleClick(i)}    //pass i 
                        winMove={this.state.winMove}
                    />
                </div>
                <div className="game-info">
                    <div>{this.reverseButton()}</div>
                    <div>{status}</div>
                    <ol style={mystyle}>{moves}</ol>
                </div>
            </div>
        );
    }
}


