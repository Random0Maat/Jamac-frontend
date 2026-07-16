import { ref } from 'vue';

const message = ref(null);
const type = ref('success');

export function useNotification() {
    const notify = (msg, msgType = 'success') => {
        message.value = msg;
        type.value = msgType;
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            message.value = null;
        }, 5000);
    };

    const clear = () => {
        message.value = null;
    };

    return {
        message,
        type,
        notify,
        clear
    };
}
