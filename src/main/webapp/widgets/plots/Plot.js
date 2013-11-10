/*******************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2011, 2013 OpenWorm.
 * http://openworm.org
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the MIT License
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *     	OpenWorm - http://openworm.org/people.html
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 *******************************************************************************/
/**
 * Plot Widget class
 * 
 * @author  Jesus R. Martinez (jesus@metacell.us)
 */

var Plot = Widget.View.extend({

	plot : null,
	plotData : [],
	
	initialize : function(options){
		this.render();
		this.dialog.append("<div class='plot' id='" + this.name + "'></div>");
	},

	defaultPlotOptions: {
		yaxis: { min : 0,max : 15},
		xaxis: {min : 0, max : 15},
		series: {
	        lines: { show: true },
	        points: { show: true }
	    }, 
	    legend: { show: true},
	    grid: { hoverable: true, clickable: true, autoHighlight: true },	    
	}, 
	
	resetPlot : function(){
		if(this.plot != null){
			this.data = [];
			this.plot.setData(this.data);
			this.plot.draw();
		}
	},
	
	addLinePlots : function(data, options){	
		//If no options specify by user, use default options
		if(options == null){options = this.defaultPlotOptions;}
		
		//plot  reference not yet created, make it for first time
		if(this.plot ==null){
			this.plotData = data;
			
			this.plot = $.plot($("#"+this.name), this.plotData,options);		
		}
		
		//plot exists, get existing plot series before adding new one
		else{
			for(var d = 0; d < data.length ; d++){
				this.plotData.push(data[d]);
			}
			this.plot.setData(this.plotData);	
			this.plot.draw();
		}
	},
	
	plotFunction : function(){
		
	}
});