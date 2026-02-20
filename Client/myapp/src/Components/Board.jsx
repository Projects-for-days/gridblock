import { useState, useEffect } from "react";
import { shuffleNumbers } from "../Utils/board.js";

export default function Board() {
    //state to store shuffled numbers
    const [numbers, setNumbers] = useState([]);
    //state to track clicked numbers
    const [clicked, setClicked] = useState({});

    // Shuffle numbers ONCE when component mounts
    useEffect(() => {
        setNumbers(shuffleNumbers());
    }, []);

    const handleClick = (num) => {
        if (clicked[num]) return;
        setClicked({ ...clicked, [num]: true });
    };

    return (
        <div id="board"> 
            {numbers.map((num) => (
                <div
                    // maps needs a key, so I will use the number itself as the key, edited by ajii
                    key={num}
                    // for the style
                    className={clicked[num] ? "clicked" : ""}    
                    // for the click handler
                    onClick={() => handleClick(num)}
                    // for the style, if the number is clicked, it will be red, otherwise it will be black, edited by ajii
                    style={clicked[num] ? { color: "red" } : {}}
                >
                    {clicked[num] ? "X" : num}
                </div>
            ))}
        </div>
    ); 
}