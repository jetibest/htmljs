(function(root)
{
	var flatten = (arr) =>
	{
		var newArray = [];
		for(var i=0;i<arr.length;++i)
		{
			var v = arr[i];
			if(Array.isArray(v))
			{
				if(v.length)
				{
					newArray = newArray.concat(flatten(v));
				} // else: ignore empty arrays
			}
			else
			{
				newArray.push(v);
			}
		}
		return newArray;
	};
	var merge = (a, b) =>
	{
		if(!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) || Array.isArray(b))
		{
			return a = b;
		}
		for(var k in b)
		{
			if(Object.prototype.hasOwnProperty.call(b, k))
			{
				if(typeof a[k] === 'object' && typeof b[k] === 'object' && !(Array.isArray(a[k]) || Array.isArray(b[k])))
				{
					merge(a[k], b[k]);
				}
				else
				{
					a[k] = b[k];
				}
			}
		}
		return a;
	};
	var handleResult = function(result, container, append)
	{
		if(result !== null && typeof result === 'object' && result.type === 'htmlElementComponent')
		{
			result.render(container, append);
		}
		else if(typeof result === 'string' || typeof result === 'number' || (typeof result === 'object' && result != null))
		{
			if(Array.isArray(result))
			{
				for(var i=0;i<result.length;++i)
				{
					handleResult(result[i], container, append);
				}
			}
			else
			{
				html.createElement('span', {innerText: result}).render(container, append);
			}
		}
	};
	return (root || {}).html = {
		$: merge((function(arr) // shortcuts for commonly used html-elements
		{
			var map = {};
			for(var i=0;i<arr.length;++i)
			{
				(function(v)
				{
					map[v] = function()
					{
						return html.createElement.apply(null, [v].concat(Array.from(arguments)));
					};
				})(arr[i]);
			}
			return map;
		})(['div', 'span', 'ul', 'li', 'dl', 'dt', 'dd', 'input', 'textarea', 'button', 'label', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', 'th', 'td', 'caption', 'header', 'footer', 'main', 'nav', 'br', 'hr', 'iframe', 'b', 'i', 'u', 'a', 'strong', 'link', 'script', 'style', 'title', 'html', 'body', 'head', 'article', 'aside', 'details', 'hgroup', 'section', 'summary', 'base', 'basefont', 'meta', 'datalist', 'fieldset', 'form', 'legend', 'meter', 'optgroup', 'option', 'select', 'blockquote', 'abbr', 'acronym', 'address', 'bdi', 'bdo', 'big', 'center', 'cite', 'code', 'del', 'dfn', 'em', 'font', 'ins', 'kbd', 'mark', 'output', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'strike', 'sub', 'sup', 'tt', 'var', 'wbr', 'dir', 'menu', 'ol', 'col', 'colgroup', 'tbody', 'thead', 'tfoot', 'noscript', 'area', 'audio', 'canvas', 'embed', 'figcaption', 'figure', 'frame', 'frameset', 'iframe', 'img', 'map', 'noframes', 'object', 'param', 'source', 'time', 'video']), {
			'precode': function()
			{
				return html.$.pre(html.$.code.apply(this, Array.from(arguments)));
			}
		}),
		id: function(id) // get html-element by id
		{
			return document.getElementById(id);
		},
		eventhandlers: { // these functions can be used as event handlers ({on...: eventhandlers.function()})
			exportElementValue: function(obj, k)
			{
				if(typeof obj === 'object' && typeof k === 'string')
				{
					return function()
					{
						return obj[k] = this.element.value;
					};
				}
				else
				{
					return function(){ return this.element.value; };
				}
			}
		},
		createRenderer: function(fnc) // used by createElement, cannot be a root element, and is always embedded in a createElement, so no use of calling this directly
		{
			return {
				render: function(container, append)
				{
					this.parent = container;
					// Test if stateless, passthrough
					var s = this;
					while(!('$state' in s))
					{
						if(!s.parent)
						{
							break;
						}
						s = s.parent;
					}
					this.root = s; // set self-reference, in case of passthrough, this may not refer to itself
					
					// set context of the child fnc to the parent
					// pass as first argument also the parent, we can use context or first argument, whichever is more convenient
					// and pass a function that will render the arguments-list, and possibly wrap in div if multiple components were specified
					var result = fnc.call(container.selfRef, container.selfRef, function()
					{
						if(arguments.length)
						{
							html.createElement('div', {}, Array.from(arguments)).render(container, append);
						}
						// else: nothing to render
					});
					handleResult(result, container, append);
					return container;
				}
			};
		},
		createElement: function(tag, options) // the main function to create nested components dynamically by javascript, see html.$ for shortcuts of this method
		{
			var children = Array.from(arguments);
			if(options === null || (typeof options === 'object' && options.type !== 'htmlElementComponent' && Object.prototype.toString.call(options) === '[object Object]'))
			{
				options = options || {};
				children = children.slice(2); // tag and options removed
			}
			else
			{
				options = {};
				children = children.slice(1); // only tag removed, no options specified
			}
			var element = document.createElement(tag);
			var self = {
				type: 'htmlElementComponent',
				tag: tag,
				parent: null, // like parentNode
                root: null, // the first parentNode that has a $state property
				listeners: {},
				element: element,
				children: []
				//$state: options.$state === null ? null : merge({}, options.$state || {}) // support null-state, for stateless passthrough.. if explicitly set to null, 'this' refers to parent, it's as if this element does not exist..
			};
			//delete options.$state;
			
			// set selfReference, this may change to parent later, if state is null
			self.selfRef = self;
			
			function _createElement()
			{
				return merge(self, {
					updateProperties: function()
					{
						// Add properties (except state)
						for(var k in options)
						{
							if(Object.prototype.hasOwnProperty.call(options, k))
							{
								var v = options[k];
								if(k === 'className' && Array.isArray(v))
								{
									v = v.join(' ');
								}
								if(/^on[a-z]+$/gi.test(k))
								{
									// event handler
									self.updateListener(k, v);
								}
								else if(/^[$]/gi.test(k))
								{
									// this is a property for the component wrapper, not the HTML element itself.. consume upon use
									if(typeof self[k] !== 'object' && self[k] !== null && !Array.isArray(self[k]))
									{
										self[k] = merge(self[k], v);
									}
									else
									{
										merge(self[k], v);
									}
									if(typeof self[k] === 'function')
									{
										self[k] = (function(fn)
										{
											// make sure context is always self (Function.bind)
											return function()
											{
												fn.apply(self, arguments);
											};
										})(self[k]);
										
										if(k === '$init')
										{
											// run as soon as it is interpreted
											self[k]();
										}
										else if(k === '$load')
										{
											// run after for example .innerHTML property has been set (but promises may not be done yet)
											setTimeout(self[k], 0);
										}
									}
									delete options[k]; // consume
								}
								else
								{
									// element[k] =  -> this won't work for attributes like element.style
									if(typeof element[k] !== 'object' && element[k] !== null && !Array.isArray(element[k]))
									{
										element[k] = merge(element[k], v);
									}
									else
									{
										merge(element[k], v);
									}
								}
							}
						}
					},
					updateState: function()
					{
						if(self !== self.selfRef)
						{
							return; // don't update state if passthrough
						}
						var s = self.$state;
						if(!s)
						{
							return;
						}
						s.isLoading = false;
						for(var k in s)
						{
							if(Object.prototype.hasOwnProperty.call(s, k))
							{
								(function(k, v)
								{
									// Automatically handle promises in first level of the state, and re-render upon completion
									if(typeof v === 'object' && v !== null)
									{
										if(v instanceof Promise)
										{
											s.isLoading = true;
											s[k] = {
												type: 'htmlPromiseHandler',
												promise: v
													.then(result => s[k] = result)
													.catch(error => s.error = error)
													.finally(self.render)
											};
										}
										else if(v.type === 'htmlPromiseHandler')
										{
											s.isLoading = true;
										}
									}
									else if(typeof v === 'function') // execute functions in state, and replace
									{
										s[k] = v.call(self, self);
									}
								})(k, s[k]);
							}
						}
		
					},
					isLoading: () => !!self.selfRef.$state.isLoading,
					hasError: () => !!self.selfRef.$state.error,
					setState: function(newstate)
					{
						merge(self.selfRef.$state, newstate);
						
						self.selfRef.render();
					},
					updateListener: function(k, fnc)
					{
						if(typeof fnc !== 'function')
						{
							if(typeof self.listeners[k] === 'function')
							{
								element.removeEventListener(k.substring(2), self.listeners[k]);
								delete self.listeners[k];
							}
						}
						else if(self.listeners[k] !== fnc) // unless listener is already exactly equal
						{
							if(typeof self.listeners[k] === 'function')
							{
								element.removeEventListener(k.substring(2), self.listeners[k]);
							}
							element.addEventListener(k.substring(2), function(e){ e = e || window.event || {}; e.$self = self.selfRef; e.$element = self.element || self.selfRef.element; options[k].call(self.selfRef, e); }, false);
							self.listeners[k] = fnc;
							
						}
					},
					destroy: function(childrenToo)
					{
						if(!self.element.parentNode)
						{
							// only return true if the element could still be destroyed (not destroyed already)
							return false;
						}
						
						// first destroy children
						if(childrenToo && self.children.length)
						{
							for(var i=0;i<self.children.length;++i)
							{
								var child = self.children[i];
								child.destroy.call(child, childrenToo);
							}
						}
						
						// also, execute all destroyCallbacks
						if(self.destroyCallbacks)
						{
							while(self.destroyCallbacks.length)
							{
								self.destroyCallbacks.shift().call(self, self);
							}
						}
						
						// then finally remove child
						self.element.parentNode.removeChild(self.element);
						
						return true;
					},
					exec: function(fn) // return a function, if you want something to be run when the component is destroyed
					{
						self.render(); // always render before exec
						
						var result = fn.call(self, self);
						if(typeof result === 'function')
						{
							self.destroyCallbacks = self.destroyCallbacks || [];
							self.destroyCallbacks.push(result);
						}
						return self;
					},
					appendTo: function(container)
					{
						return self.render(container, true); // alias for render with append=true
					},
					render: function(container, append)
					{
						if(container && container.element)
						{
							self.parent = container;
							// Test if stateless, passthrough
							var s = self;
							while(!('$state' in s))
							{
								if(!s.parent)
								{
									break;
								}
								s = s.parent;
							}
							self.root = s; // set self-reference, in case of passthrough, this may not refer to itself
						}
						
						// Update properties
						self.updateProperties();
						
						// Update state
						self.updateState();
						
						// Update content, but only if there's a parentNode (thus it is not destroyed)
						if(container || self.element.parentNode)
						{
							if(self.children.length)
							{
								self.element.innerHTML = '';
								
								for(var child of self.children)
								{
									child.render.call(child, self, true);
								}
							}
						}
						
						// Update binding to parent
						if(container)
						{
							var c = container.element || container;
							var ctag = (c.nodeName + '').toLowerCase();
							var isTextContentOnly = ctag === 'script' || ctag === 'style';
							if(append)
							{
								if(isTextContentOnly)
								{
									c.innerText += self.element.innerText;
								}
								else
								{
									c.appendChild(self.element);
								}
							}
							else
							{
								if(isTextContentOnly)
								{
									c.innerText = self.element.innerText;
								}
								else
								{
									c.innerHTML = '';
									c.appendChild(self.element);
								}
							}
						}
						
						return null; // explicitly return null for render function, as it should always be the last in chain, otherwise, when returning from Renderer it may result in rendering twice
					}
				});
			}
			// check if any child has a Promise (children has to be an array)
			var _handleChildren = function(children)
			{
				var self = this;
				var promises = [];
				for(var i=0;i<children.length;++i)
				{
					var child = children[i];
					if(typeof child === 'object' && child !== null && child instanceof Promise)
					{
						// set children result upon completion
						(function(child, i)
						{
							promises.push(new Promise(function(resolve, reject)
							{
								child.then(function(result)
								{
									var subPromises = _handleChildren.call(self, flatten([result]));
									
									if(subPromises.length > 0)
									{
										// wait until sub children have been resolved before resolving this child
										Promise.all(subPromises).then(resolve).catch(reject);
									}
									else
									{
										resolve();
									}
								
								}).catch(reject);
							}));
						})(child, i);
					}
					else if(typeof child === 'function')
					{
						// if a function is given, we intend to use it as an inline render-only object
						children[i] = html.createRenderer(child);
					}
					else if(typeof child !== 'object')
					{
						children[i] = html.createElement('span', {innerText: child});
					}
					else if(child === null)
					{
						children.splice(i--, 1);
					}
				}
				return promises;
			};
			
			// set property reference
			self.children = children = flatten(children);
			
			// handle children recursively async
			var promises = _handleChildren.call(self, children);
			
			if(promises.length > 0)
			{
				// return a new promise, that will return the object after children promises have been fulfilled
				return new Promise(function(resolve, reject)
				{
					Promise.all(promises).then(function()
					{
						resolve(_createElement());
					}).catch(reject);
				});
			}
			else
			{
				return _createElement();
			}
		}
	};
})(window);
