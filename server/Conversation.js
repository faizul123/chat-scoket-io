

function Conversation(init) {
    const conversations = init ? init : [];
    //console.log("conversations ----> ", init)
    return function() {
        const addMessage = (message) => {
            conversations.push(message);
        }

        const getConversations = (fromSid, toSid) => {
            const messages = conversations.filter((message) => {
                return (message.from === fromSid && message.to === toSid) || (message.from === toSid && message.to === fromSid);
            }).sort((a, b) => b.seqId - a.seqId);
            return messages;
        }

        return {
            addMessage,
            getConversations,
        }
    }();
}

const conversation = Conversation();

module.exports = conversation;


