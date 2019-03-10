import touchAs from './touch-as';

export default function manageTemplateTouch(template) {
	if (Object(template.touch) === template.touch) {
		Object.keys(template.touch).forEach(filename => {
			touchAs(filename, template.touch[filename]);
		});
	}
}
