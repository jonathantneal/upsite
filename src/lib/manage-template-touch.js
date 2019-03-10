import touchAs from './touch-as';

export default function manageTemplateTouch(template, argo) {
	if (Object(template.touch) === template.touch) {
		Object.keys(template.touch).forEach(filename => {
			const normalizedFilename = normalizeFilename(filename, argo);

			touchAs(normalizedFilename, template.touch[filename]);
		});
	}
}

function normalizeFilename(filename, argo) {
	return filename.replace(/\$\{(\w+)\}/g, ($0, $1) => {
		return $1 in argo ? argo[$1] : $0;
	});
}
