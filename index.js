"use strict";

function toDot(modules) {
	console.log("digraph G {");
	console.log("edge [dir=back]")
	modules.forEach(m => {
		m.deps.forEach(dep => {
			console.log(`"${dep}" -> "${m.id}"`);
		});
	});
	console.log("}");
}

function prune(modules) {
	let avail = modules.filter(m => m.deps.length == 0);
	if (!avail.length) { return; }

	let id = avail[0].id;
//    console.log("pruning", id);
	let index = modules.indexOf(avail[0]);
	modules.splice(index, 1);
	modules.forEach(m => {
		m.deps = m.deps.filter(dep => dep != id);
	});
	prune(modules);
}

function getPrefix(ids) {
	if (ids.length < 2) { return ""; }
	return ids.reduce((prefix, val) => {
		while (val.indexOf(prefix) != 0) { prefix = prefix.substring(0, prefix.length-1); }
		return prefix;
	});
}

module.exports = function plugin(options = {}) {
	return {
		ongenerate(data) {
			let ids = data.bundle.modules.map(m => m.id);
			let prefix = getPrefix(ids);

			let modules = [];
			data.bundle.modules.forEach(module => {
				let m = {
					id: module.id.substring(prefix.length),
					deps: module.dependencies.map(dep => dep.substring(prefix.length))
				}
				modules.push(m);
			});
			if (options.prune) { prune(modules); }
			toDot(modules);
		}
	}
}
