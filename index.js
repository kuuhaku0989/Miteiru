/* eslint-disable max-nested-callbacks */
const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const ahuheLib = require('./ahuhe.json');
const YouTube = require('youtube-live-chat');

const client = new Discord.Client();
client.cooldowns = new Discord.Collection();

const yt = new YouTube('UCdn5BQ06XqgXoAxIhbqw5Rg', config.apiKeys[config.apiKeyNr]);

let listening = false;

let chatChannel = null;

const delay = 4000;


// UC7YXqPO3eUnxbJ6rN0z2z1Q
// Des: UCRwHhvTMPawgJhb5Fy934WQ
// Self: UCOU2Ok2G7ZfQp2RSbT97Mqg


yt.on('ready', () => {
	console.log('ready!');
});

yt.on('message', data => {
	if(data.snippet.authorChannelId === 'UCRwHhvTMPawgJhb5Fy934WQ' && data.snippet.displayMessage.startsWith('[英訳/EN]')) {
		chatChannel.send(data.snippet.displayMessage.slice(7).trim());

		fs.appendFile('Transcripts/' + yt.liveId + '.txt', data.snippet.publishedAt.slice(11, 19) + '\t' + data.snippet.displayMessage.slice(7).trim() + '\n', function(err) {
			if (err) throw err;
		});
	}
});

yt.on('error', error => {
	console.error(error);
	if(error.message === 'The request cannot be completed because you have exceeded your <a href="/youtube/v3/getting-started#quota">quota</a>.') {
		config.apiKeyNr = (config.apiKeyNr + 1) % config.apiKeys.length;
		yt.key = config.apiKeys[config.apiKeyNr];
		saveConfig();
	}
});


// TODO:
// + auto start/stop for LiveTL
// + reformat variable into config for expandability
// + introduce weighted gacha (SSR YAGOO)
// + help args for specific commands
// - vc Lobby bug

// help embed
const help = new Discord.MessageEmbed()
	.setColor('00AA00')
	.setTitle('Miteiru functions')
	.setURL('https://github.com/kuuhaku0989/Miteiru')
	.setAuthor('Miteiru')
	.addFields(
		{ name: '~help', value: 'sends you this embed\ncooldown: 1h\n' },
		{ name: '--emote functions--', value: '\u200B' },
		{ name: 'ahuhe', value: 'rolls ahuhe gacha\nOnly usable in <#806569468150677524>\ncooldown: 30s' },
		{ name: 'gutter', value: 'rolls ahuhe gacha\nOnly usable in <#762676990155030578>\ncooldown: 30s' },
		{ name: '~mp', value: 'list of available multi-part emotes\ncooldown: 15m' },
		{ name: '~[name]', value: 'sends multi-part emote\ncooldown: 120s' },
		{ name: '~beam [@target]', value: '*fires a beam* if target is provided, beams the target\ncooldown: 3h\n' },
		{ name: '--vc functions--', value: '\u200B' },
		{ name: '~cn [name]', value: 'changes the name of created vc lobbies to [name]\n**Mod only**' },
		{ name: '~bc [channelId]', value: 'changes the channel that triggers vc creating to the one provided\n**Mod only**' },
		{ name: '--LiveTL functions--', value: '\u200B' },
		{ name: '~yt', value: 'gets Des\'s LiveTLs from Fubuki\'s active Livechat' },
		{ name: '~ytc [YTChannelId]', value: 'gets LiveTLs from the provided channels active Livechat' },
		{ name: '~ytv [YTVideoId]', value: 'gets LiveTLs from the provided Livestreams Livechat' },
		{ name: '~stop', value: 'stops getting LiveTLs' },
		{ name: '~ytkey', value: 'toggles between API keys' },
		{ name: '\u200B', value: 'for any requests or complaints please contact ᲼᲼᲼#0989 aka.『          』\n~~Stream-notification functionlity comming soon~~' },
	)
	.setFooter('by ᲼᲼᲼#0989 aka.『          』');


function saveConfig() {
	const jsonString = JSON.stringify(config);

	fs.writeFile('./config.json', jsonString, err => {
		if (err) {
			console.log('Error writing file', err);
		}
		else {
			console.log('Successfully wrote file ');
		}
	});
}

// startup
client.once('ready', () => {
	console.log('Ready!');

	yt.listen();

	// delete unused channels
	config.ids.forEach(id => {
		client.channels.fetch(id).then((channel) => {
			if(channel.members.size < 1) {
				config.ids.splice(config.ids.indexOf(id));
				channel.delete();
				saveConfig();
			}
		});
	});

	client.user.setPresence({
		activity: { name: 'the recorder/	~help' },
		status: 'online',
	});
});

// commands
client.on('message', message => {
	// ahuhe gacha
	if(message.mentions.has('806272226282045451')) {
		message.reply('ジーーー！');
		return;
	}

	if (message.content.toLowerCase() === 'ahuhe' && message.channel.id === '806569468150677524') {
		const { cooldowns } = client;

		if (!cooldowns.has('ahuhe')) {
			cooldowns.set('ahuhe', new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get('ahuhe');
		const cooldownAmount = (ahuheLib.cooldownAhuhe || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
			if (now < expirationTime) {
				return;
			}
		}

		message.channel.send(
			ahuheLib.ahuhe[Math.floor(Math.random() * ahuheLib.ahuhe.length)],
		);

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	// gutter gacha
	if (message.content.toLowerCase() === 'gutter' && message.channel.id === '762676990155030578') {
		const { cooldowns } = client;

		if (!cooldowns.has('gutter')) {
			cooldowns.set('gutter', new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get('gutter');
		const cooldownAmount = (ahuheLib.cooldownAhuhe || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
			if (now < expirationTime) {
				return;
			}
		}


		message.channel.send(ahuheLib.gutter[Math.floor(Math.random() * ahuheLib.gutter.length)]);

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}


	// functions with prefix
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	const args = message.content
		.slice(config.prefix.length)
		.trim()
		.split(/ +/);
	const command = args.shift().toLowerCase();

	const { cooldowns } = client;
	const now = Date.now();

	switch (command) {

	// "channel name" of created lobbies
	case 'cn':
		if (message.member.roles.cache.has(config.modRoleID) || message.member.id === '312656627067125761') {
			config.lobbyName = message.content
				.slice(config.prefix.length + command.length)
				.trim();

			saveConfig();
		}
		break;

		// "base channel", trigger for vc lobbies
	case 'bc':
		if (message.member.roles.cache.has(config.modRoleID) || message.member.id === '312656627067125761') {
			config.baseChannel = args[0];

			saveConfig();
		}
		break;

		// help function
	case 'help':
	{
		if (!cooldowns.has('help')) {
			cooldowns.set('help', new Discord.Collection());
		}

		const timestampshelp = cooldowns.get('help');

		if (timestampshelp.has(message.author.id)) {
			const expirationTime = timestampshelp.get(message.author.id) + (3600 || 3) * 1000;
			if (now < expirationTime) {
				return;
			}
		}

		message.author.send(help);

		timestampshelp.set(message.author.id, now);
		setTimeout(() => timestampshelp.delete(message.author.id), (3600 || 3) * 1000);
		break;
	}

	case 'test': {
		if (message.reference == null || message.channel.messages.cache.get(message.reference.messageID) == null) {
			console.log('no reference');
		}
		else {
			const target = message.channel.messages.cache.get(message.reference.messageID).author;
			console.log(target.id);
		}
		break;
	}

	// beam emote
	case 'beam': {

		if (!cooldowns.has('beam')) {
			cooldowns.set('beam', new Discord.Collection());
		}

		const timestampsbeam = cooldowns.get('beam');

		if (timestampsbeam.has(message.author.id)) {
			const expirationTime = timestampsbeam.get(message.author.id) + (10800 || 3) * 1000;
			if (now < expirationTime) {
				return;
			}
		}

		let target = null;

		if (!(message.reference == null || message.channel.messages.cache.get(message.reference.messageID) == null)) {
			target = message.channel.messages.cache.get(message.reference.messageID).author;
		}

		if (message.mentions.users.size > 0) {
			target = message.mentions.users.first();
		}


		if (target != null) {


			// eslint-disable-next-line no-control-regex
			let name = target.username.replace(/[^0-9A-Za-z_]/g, '');
			if(name.length() < 2) {
				name += '__';
			}

			client.guilds.fetch('678259497193570304').then((home) => {
				home.emojis.create(target.avatarURL(), name).then((emote) => {
					message.channel.send('<:FBKBEAM3:806142676528267284><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330>' + emote.toString())
						.then((msg)=> {

							setTimeout(function() {
								msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330>' + emote.toString());
							}, 2000);

							setTimeout(function() {
								msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:blank:839598445567672330><:blank:839598445567672330>' + emote.toString());
							}, 3000);

							setTimeout(function() {
								msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:blank:839598445567672330>' + emote.toString());
							}, 4000);

							setTimeout(function() {
								msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456>' + emote.toString());
							}, 5000);

							setTimeout(function() {
								msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FubukiAhuheExplosion:809228050818007040>');
							}, 7000);

							setTimeout(function() {
								msg.edit('<a:FoobzillaPatting:785094087975370772><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330><:friend:843895455300714506>');
							}, 11000);
						});
					setTimeout(function() {emote.delete();}, 20000);
				});
			});
		}
		else {
			message.channel.send('<:FBKBEAM3:806142676528267284><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330>')
				.then((msg)=> {

					setTimeout(function() {
						msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330>');
					}, 2000);

					setTimeout(function() {
						msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330>');
					}, 3000);

					setTimeout(function() {
						msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:blank:839598445567672330><:blank:839598445567672330>');
					}, 4000);

					setTimeout(function() {
						msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:blank:839598445567672330>');
					}, 5000);

					setTimeout(function() {
						msg.edit('<:FBKBEAM3:806142676528267284><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FBKBEAN2:806142675891388456><:FubukiAhuheExplosion:809228050818007040>');
					}, 7000);

					setTimeout(function() {
						msg.edit('<a:FoobzillaPatting:785094087975370772><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330><:blank:839598445567672330><:friend:843895455300714506>');
					}, 11000);
				});
		}

		if(message.author.id !== '312656627067125761') {
			timestampsbeam.set(message.author.id, now);
			setTimeout(() => timestampsbeam.delete(message.author.id), (10800 || 3) * 1000);
		}
		break;
	}

	case 'rrat': {

		if (!cooldowns.has('rrat')) {
			cooldowns.set('rrat', new Discord.Collection());
		}

		const timestampsbeam = cooldowns.get('rrat');

		if (timestampsbeam.has(message.author.id)) {
			const expirationTime = timestampsbeam.get(message.author.id) + (10800 || 3) * 1000;
			if (now < expirationTime) {
				return;
			}
		}

		let target = null;

		if (!(message.reference == null || message.channel.messages.cache.get(message.reference.messageID) == null)) {
			target = message.channel.messages.cache.get(message.reference.messageID).author;
		}

		if (message.mentions.users.size > 0) {
			target = message.mentions.users.first();
		}


		if (target != null) {


			// eslint-disable-next-line no-control-regex
			let name = target.username.replace(/[^0-9A-Za-z_]/g, '');
			if(name.length() < 2) {
				name += '__';
			}

			client.guilds.fetch('838752639219007498').then((home) => {
				home.emojis.create(target.avatarURL(), name).then((emote) => {
					message.channel.send('<:Gutter:846081431934599238><:blank:839598445567672330><:blank:839598445567672330>' + emote.toString() + '🧹')
						.then((msg)=> {

							setTimeout(function() {
								msg.edit('<:Gutter:846081431934599238><:blank:839598445567672330>' + emote.toString() + '🧹');
							}, 2000);

							setTimeout(function() {
								msg.edit('<:Gutter:846081431934599238>' + emote.toString() + '🧹');
							}, 3000);

							setTimeout(function() {
								msg.edit('<:GutterFubukiStuck:786142064273260555>' + '🧹');
							}, 4000);

							setTimeout(function() {
								msg.edit('<:GutterFubuki:726717655104487547>');
							}, 6000);
						});
					setTimeout(function() {emote.delete();}, 20000);
				});
			});
			if(message.author.id !== '312656627067125761') {
				timestampsbeam.set(message.author.id, now);
				setTimeout(() => timestampsbeam.delete(message.author.id), (10800 || 3) * 1000);
			}
		}

		break;
	}

	// multi-part emote list
	case 'mp': {

		if (!cooldowns.has('hmp')) {
			cooldowns.set('hmp', new Discord.Collection());
		}

		const timestamps = cooldowns.get('hmp');
		const cooldownAmount = (3600 || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
			if (now < expirationTime) {
				return;
			}
		}

		message.channel.send(Object.keys(ahuheLib.multipart));

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		break;
	}

	case 'yt':
		{
			if(!listening) {
				console.log('yt');
				client.user.setPresence({
					activity: { name: 'Fubuki', url: 'https://www.youtube.com/UCdn5BQ06XqgXoAxIhbqw5Rg/live', type: 'WATCHING' },
					status: 'online',
				});
				yt.id = 'UCdn5BQ06XqgXoAxIhbqw5Rg';
				yt.getLive();
				yt.start(delay);
				listening = true;
				message.channel.send('now watching: Fubuki');
				chatChannel = message.channel;
			}
			else {
				message.channel.send('already watching livestream');
			}
		}
		break;

	case 'ytkey':
		{
			config.apiKeyNr = (config.apiKeyNr + 1) % config.apiKeys.length;
			yt.key = config.apiKeys[config.apiKeyNr];
			saveConfig();
		}
		break;

	case 'ytc':
		{
			if(!listening) {
				console.log('ytc');
				yt.id = args[0];
				client.user.setPresence({
					activity: { name: 'a Livestream', url: 'https://www.youtube.com/' + args[0] + '/live', type: 'WATCHING' },
					status: 'online',
				});
				yt.getLive();
				yt.start(delay);
				listening = true;
				message.channel.send('now watching: ' + yt.liveId);
				chatChannel = message.channel;
			}
			else {
				message.channel.send('already watching a livestream');
			}
		}
		break;

		// activity: { name: 'the recorder/	~help', url: 'https://www.youtube.com/watch?v=' + args[0], type: 'WATCHING' },


	case 'ytv':
		{
			if(!listening) {
				console.log('ytv');
				yt.liveId = args[0];
				client.user.setPresence({
					activity: { name: 'a Livestream', url: 'https://www.youtube.com/watch?v=' + args[0], type: 'WATCHING' },
					status: 'online',
				});
				yt.getChatId();
				yt.start(delay);
				listening = true;
				message.channel.send('now watching: ' + yt.liveId);
				chatChannel = message.channel;
			}
			else {
				message.channel.send('already watching a livestream');
			}
		}
		break;

	case 'stop':
		{
			if(listening) {
				yt.stop();
				listening = false;
				message.channel.send('stopped watching: ' + yt.liveId);
				client.user.setPresence({
					activity: { name: 'the recorder/	~help', type: 'PLAYING' },
					status: 'online',
				});
			}
			else {
				message.channel.send('currently not watching any livestream');
			}
		}
		break;

	// multi-part emotes
	default: {

		if(command in ahuheLib.multipart) {

			if (!cooldowns.has('mp')) {
				cooldowns.set('mp', new Discord.Collection());
			}

			const timestamps = cooldowns.get('mp');
			const cooldownAmount = (ahuheLib.cooldownMultiPart || 3) * 1000;

			if (timestamps.has(message.author.id)) {
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
				if (now < expirationTime) {
					return;
				}
			}

			message.channel.send(ahuheLib.multipart[command]);

			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
			break;
		}
		break;
	}

	}

});

// vc functionality
client.on('voiceStateUpdate', (oldState, newState) => {
	// Logging
	if (oldState.member.user.bot || newState.member.user.bot) return;
	console.log('-------------\ntick\n');

	// Old State
	if (oldState.channel !== null) {
		console.log(
			'Old State\n' + oldState.channel.name + '/' + oldState.channelID,
		);

		if (
			config.ids.indexOf(oldState.channelID) != -1 &&
      oldState.channel.members.size == 0
		) {
			oldState.channel.delete();
			config.ids.splice(config.ids.indexOf(oldState.channelID));
		}

		console.log(config.ids.indexOf(oldState.channelID));
	}

	// New State
	if (newState.channel !== null) {
		console.log(
			'New State\n' + newState.channel.name + '/' + newState.channelID,
		);

		if (newState.channelID === config.baseChannel && config.ids.length < 4) {
			console.log(newState.channel.members.size);
			newState.guild.channels
				.create(config.lobbyName, {
					type: 'voice',
					parent: newState.channel.parent,
				})
				.then(channel => {
					newState.member.voice.setChannel(channel);
					config.ids.push(channel.id);
				});
		}
	}
});

client.login(config.token);
