const ui = (function()
{
	const $ = html.$;
	return {
		codesample: (title, url) =>
		{
			return $.div(
				{
					$state: {
						code: util.promise(util.request, url)
					}
				},
				$.h3(title),
				function()
				{
					if(this.hasError()) return $.div('Error: ' + this.$state.error);
					if(this.isLoading()) return $.div('Loading...');
					return $.div({className: 'code-comparison-wrapper'},
						$.precode(this.$state.code),
						$.div({className: 'code-output-container'}, $.script({innerHTML: this.$state.code}))
					);
				}
			);
		},
		main: () =>
		{
			return $.div(
				$.h1('html.js'),
				
				$.h2('A JavaScript wrapper for building user interfaces'),
				$.ul(
					$.li('Very ', $.b('lightweight'), ' (less than 5 KiB)'),
					$.li('Promotes elegant and ', $.b('readable'), ' code'),
					$.li($.b('Easy'), ' to use')
				),
				
				$.h2('Usage examples'),
				$.p('Note that these examples were written with minimal code. View the source code of this website, for a bigger example.'),
				ui.codesample('HelloMessage', 'example-hello-html.js'),
				ui.codesample('Timer', 'example-timer-html.js'),
				ui.codesample('TodoApp', 'example-todoapp-html.js'),
				
				$.h2('Installation'),
				$.div(
					'Just include ',
					$.code('<script src="html.js"></script>'),
					' and use an alias like: ',
					$.code('const $ = html.$;'),
					'.'
				)
			);
		},
		init: c =>
		{
			ui.main().render(c);
		}
	};
})();
