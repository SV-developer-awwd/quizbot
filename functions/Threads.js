class Threads {
    async create(client, channel_id, name, reason, isPrivate = false) { // create + auto join
        const channel = client.channels.cache.get(channel_id)
        const settings = {
            name, reason,
            autoArchiveDuration: 60
        }

        if (isPrivate) {
            settings.type = 'GUILD_PRIVATE_THREAD'
        }
        const thread = await channel.threads.create(settings)

        await this.join(client, thread.id)
        return thread.id
    }

    async addMembers(client, thread_id, members) {
        const thread = client.channels.cache.get(thread_id)

        for (const member of members) {
            await thread.members.add(member)
        }
    }

    async removeMembers(client, thread_id, members) {
        const thread = client.channels.cache.get(thread_id)

        for (const member of members) {
            await thread.members.remove(member)
        }
    }

    async archive(client, thread_id, archive = true) {
        const thread = client.channels.cache.get(thread_id)
        await thread.setArchived(archive)
    }

    async lock(client, thread_id, lock = true) {
        const thread = client.channels.cache.get(thread_id)
        if (!thread.archived) {
            await thread.setLocked(lock)
            return
        }

        return false
    }

    async join(client, thread_id) {
        const thread = client.channels.cache.get(thread_id)
        await thread.join()
    }

    async leave(client, thread_id) {
        const thread = client.channels.cache.get(thread_id)
        await thread.leave()
    }

    async send(client, thread_id, message) {
        const thread = client.channels.cache.get(thread_id)
        return await thread.send(message)
    }
}

module.exports = new Threads()