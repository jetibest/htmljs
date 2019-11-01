var util = {
	promise: function(fnc)
	{
		return new Promise((resolve, reject) =>
		{
			var result = fnc.apply(this, Array.from(arguments).slice(1).concat(function(err, result)
			{
				if(err)
				{
					return reject(err);
				}
				resolve(result);
			}));
		});
	},
	request: function(options, cb)
	{
		if(typeof options === 'string')
		{
			options = {url: options};
		}
		else
		{
			options = options || {};
		}
		options.headers = options.headers || {};
		
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function()
		{
			if(xmlhttp.readyState === 4)
			{
				if(xmlhttp.status === 200)
				{
					cb.call(xmlhttp, false, xmlhttp.responseText);
				}
				else
				{
					cb.call(xmlhttp, xmlhttp.status || 'Response status not OK');
				}
			}
		};
		xmlhttp.timeout = (options.timeout || 30)*1000;
		xmlhttp.open(options.method || 'GET', options.url || '', true);
		for(var k in options.headers)
		{
			if(Object.prototype.hasOwnProperty.call(options.headers, k))
			{
				xmlhttp.setRequestHeader(k, options.headers[k]);
			}
		}
		xmlhttp.send(options.data || null);
		return xmlhttp;
	}
};
