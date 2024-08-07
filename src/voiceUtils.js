import { getVoiceConnection } from '@discordjs/voice';

export async function leaveVoiceChannel(guildId) {
    try {
        const connection = await getVoiceConnection(guildId);
        if (connection) {
            connection.disconnect();
            return true;
        } else {
            return false;
        }
    } catch(error) {
        console.error('Error occurred while disconnecting from voice channel:', error);
        return false;
    }
}