const React = require("react");

function MessageButton({onClick}: {onClick: () => void}) {
    return <button onClick={onClick}>Click me</button>;
}

export default MessageButton;


