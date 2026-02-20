import { startTurn } from '../Utils/timer';

export default function Timer() {
    return (
        <div><button onClick={() => startTurn(15)}>Start Timer</button></div>
    );
}