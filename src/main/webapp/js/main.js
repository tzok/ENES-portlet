/*
 * Copyright (c) 2015:
 * Istituto Nazionale di Fisica Nucleare (INFN), Italy
 * 
 * See http://www.infn.it and and http://www.consorzio-cometa.it for details on
 * the copyright holders.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Adds the i-th job record
 */
function addJobRecord(i, jrec) {
	job_id = jrec.id;
	job_status = jrec.status;
	job_date = jrec.date;
	job_lastchange = jrec.last_change;
	job_description = jrec.description;
	out_files = jrec.output_files;
	var OutFiles = '';
	if (job_status == 'DONE') {
		del_btn = '<button id="cln_btn' + job_id + '"'
				+ '        class="btn btn-xs btn-danger"'
				+ '        type="button"' + '        data-toggle="modal"'
				+ '        data-target="#confirmDelete"'
				+ '        data-title="Delete job"'
				+ '        data-message="Are you sure you want to delete job?"'
				+ '        data-data="' + job_id + '">'
				+ '<i class="glyphicon glyphicon-trash"></i> Delete'
				+ '</button>';
		for (var j = 0; j < out_files.length; j++)
			OutFiles += '<div class="row">' + '  <div class="col-sm-3">'
					+ '  <a href="' + webapp_settings.apiserver_base_url + '/' + out_files[j].url
					+ '">' + out_files[j].name + '</a>' + '  </div>'
					+ '  <div class="col-sm-3">' + '  </div>'
					+ '  <div class="col-sm-3">' + '  </div>' + '</div>';
	} else {
		del_btn = '';
		OutFiles = '  <div class="col-sm-3"><small>No output available yet</small>'
				+ '  </div>'
				+ '  <div class="col-sm-3">'
				+ '  </div>'
				+ '  <div class="col-sm-3">' + '  </div>';
	}
	if (job_status != 'CANCELLED')
		TableRow = '<tr id="' + job_id + '">' + '   <td rowspan="2">'
				+ '        <button id="job_btn' + job_id
				+ '" class="btn btn-default btn-xs toggle">'
				+ '        <span class="glyphicon glyphicon-eye-open"></span>'
				+ '        </button>' + '	</td>' + '  <td>' + job_date
				+ '</td>' + '  <td>' + job_lastchange + '</td>' + '  <td>'
				+ job_status + '</td>' + '  <td>' + job_description + '</td>'
				+ '</tr>' + '<tr class="tablesorter-childRow">'
				+ '<td colspan="4">' + '<div class="row">'
				+ '  <div class="col-sm-3"><b>Output</b></div>'
				+ '  <div class="col-sm-3"></div>' + '  <div class="col-sm-3">'
				+ del_btn + '</div>' + '</div>' + OutFiles + '</td>' + '</tr>';
	return TableRow;
}

/*
 * Clean the specified job
 */
function cleanJob(job_id) {
	$.ajax({
		type : "DELETE",
		url : webapp_settings.apiserver_base_url + '/tasks/' + job_id,
		dataType : "json",
		success : function(data) {
			$('#confirmJobDel').hide();
			$('#cancelJobDel').text('Continue');
			$('#confirmDelete').find('.modal-body p').text(
					'Successfully removed job');
			$('#jobTable').find('#' + job_id).next().remove();
			if (getNumJobs() > 0)
				$('#jobTable').find('#' + job_id).remove();
			else
				emptyJobTable();
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert(jqXHR.status);
		}
	});
}
/*
 * Fills the job table from incoming JSON data
 */
function fillJobTable(data) {
	var tableRows = '';
	for (var i = 0; i < data.length; i++) {
		tableRows += addJobRecord(i, data[i]);
	}
	jobsTable = '<table id="jobTable" class="table table-responsive tablesorter">'
			+ '	<colgroup>'
			+ '		<col/>'
			+ '		<col/>'
			+ '		<col/>'
			+ '		<col/>'
			+ '	</colgroup>'
			+ '	<thead>'
			+ '           <tr>'
			+ '               <th></th>'
			+ '                <th>Submitted</th>'
			+ '                <th>Modified</th>'
			+ '                <th>Status</th>'
			+ '                <th>Description</th>'
			+ '            </tr>'
			+ '	</thead>'
			+ '      <tbody id="jobRecords">'
			+ tableRows
			+ '      </tbody>'
			+ '<tfoot style="size:0px">'
			+ '</tfoot>'
			+ '</table>';
	// Add table
	$('#jobsDiv').append(jobsTable);
	// Compress childs
	$('.tablesorter-childRow td').hide();
	// Sort table
	$("#jobTable").tablesorter({
		theme : 'blue',
		sortList : [ [ 1, 1 ] ],
		cssChildRow : "tablesorter-childRow"
	});
	$('.tablesorter').delegate(
			'.toggle',
			'click',
			function() {
				$(this).closest('tr')
						.nextUntil('tr:not(.tablesorter-childRow)').find('td')
						.toggle();
				return false;
			});
}

/*
 * Set empty job table
 */
function emptyJobTable() {
	$('#jobsDiv').html('<small>No jobs available yet</small>');
}

/*
 * Calls the API Server to generate the Jobs table
 */
function prepareJobTable() {
	$('#jobsDiv').html('');
	$('#jobsDiv').attr('data-modify', 'false');
	$.ajax({
		type : "GET",
		url : webapp_settings.apiserver_base_url + '/tasks?user='
				+ webapp_settings.username + '&application='
				+ webapp_settings.app_id,
		dataType : "json",
		success : function(data) {
			if (data.length > 0)
				fillJobTable(data);
			else
				emptyJobTable();
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert(jqXHR.status);
		}
	});
}
/*
 * Helper function returnin the number of jobs
 */
function getNumJobs() {
	return Math.floor(($('#jobTable tr').size() - 1) / 2);
}
/*
 * Function responsible of job submission
 */
function submit(job_desc) {
	$('#submitButton').hide();
	job_failed = '<div class="alert alert-danger">'
			+ '<strong>ERROR!</strong> Failed to submit job.' + '</div>';
	job_success = '<div class="alert alert-success">'
			+ '<strong>Success!</strong> Job successfully sent.' + '</div>';
	job_warning = '<div class="alert alert-warning">'
			+ '<strong>WARNING!</strong> Unable to get job details.' + '</div>';
	job_description = $('#jobDescription').val();
	$('#modal-content').html('');
	// 1st call to register job
	$.ajax({
		url : webapp_settings.apiserver_base_url + '/tasks?user='
				+ webapp_settings.username,
		type : "POST",
		cache : false,
		dataType : "json",
		contentType : "application/json; charset=utf-8",
		data : JSON.stringify(job_desc),
		success : function(data) {
			// 2nd call finalize and start submission
			$.ajax({
				url : webapp_settings.apiserver_base_url + '/tasks/' + data.id
						+ '/input?user=' + webapp_settings.username,
				type : "POST",
				cache : false,
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				data : JSON.stringify({}),
				success : function(data) {
					$('#jobTable').remove();
					prepareJobTable();
				},
				error : function(jqXHR, textStatus, errorThrown) {
					$('#modal-content').html(job_failed);
					alert(jqXHR.status);
				}
			});
		},
		error : function(jqXHR, textStatus, errorThrown) {
			$('#modal-content').html(job_failed);
			alert(jqXHR.status);
		}
	});
}

/*
 * Function that checks for job status change
 */
function checkJobs() {
	$('#jobTable tr').each(
			function(i, row) {
				if (i > 0 // Starting after thead
						&& i % 2 != 0 // Consider only odd rows (no childs)
				) { // Consider only active states
					jstatus = row.cells[3].innerHTML;
					if (jstatus != 'DONE' && jstatus != 'FAILED'
							&& jstatus != 'ABORT')
						$.ajax({
							url : webapp_settings.apiserver_base_url
									+ '/tasks/' + row.id + '?user='
									+ webapp_settings.username,
							type : "GET",
							cache : false,
							contentType : "application/json; charset=utf-8",
							success : function(data) {
								jstatus = $('#' + data.id).find("td").eq(3)
										.html();
								if (jstatus != data.jstatus) {
									if (data.status == 'DONE')
										prepareJobTable();
									else
										$('#' + data.id).find("td").eq(3).html(
												data.status);
									$('#jobsDiv').attr('data-modify', 'true');
								}
							},
							error : function(jqXHR, textStatus, errorThrown) {
								console.log(jqXHR.status);
							}
						});
				}
			});
	// Set timeout again for the next loop
	setTimeout(checkJobs, TimerDelay);
}
/*
 * Function that opens the submit modal frame
 */
function openModal() {
	var currentdate = new Date();
	var datetime = ('0' + currentdate.getDate()).slice(-2) + "/" 
	             + ('0' + (currentdate.getMonth() + 1)).slice(-2) + "/"
	             + currentdate.getFullYear() + " @ "
	             + ('0' + currentdate.getHours()).slice(-2)	+ ":"
	             + ('0' + currentdate.getMinutes()).slice(-2) + ":"
	             + ('0' + currentdate.getSeconds()).slice(-2);

	$('#recap-analysis').html($('#analysis').val());
	$('#recap-model').html($('#model').val());
	$('#recap-scenario').html($('#scenario').val());
	$('#recap-frequency').html($('#frequency').val());
	$('#recap-percentile').html($('#percentile').val());
	$('#recap-temporalScenario').html($('#temporalScenario').val());
	$('#recap-temporalHistorical').html($('#temporalHistorical').val());
	$('#recap-spatial').html(
			$('input[type="radio"][name="subset"]:checked').val());

	$('#submitButton').show();
	$('#modal-content').html('');
	$('#jobDescription').val('Climate Model run ' + datetime);
	$("#enesModal").modal();
}
/*
 * App specific job submission call; Just prepare the job_desc and call the
 * submit() function
 */
function submitJob() {
	var job_arguments = new Array();
	var output_1 = new Object();

	job_usrdesc = $('#jobDescription').val();

	if ($('#analysis').val() === "Trend analysis") {
		job_arguments.push("./precip_trend_analysis.json");
	}

	var oph_args = "\"4";
	oph_args = oph_args.concat(" " + $('#model').val());
	oph_args = oph_args.concat(" " + $('#scenario').val());
	oph_args = oph_args.concat(" " + $('#frequency').val());
	oph_args = oph_args.concat(" " + ($('#percentile').val().valueOf() / 100));
	oph_args = oph_args.concat(" "
			+ $('#temporalHistorical').val().replace(",", "_"));
	oph_args = oph_args.concat(" "
			+ $('#temporalScenario').val().replace(",", "_"));
	oph_args = oph_args
			.concat(" -90:90|0:360 /data/repository /home/sysm01/INDIGO\"");
	job_arguments.push(oph_args);

	output_1.name = "out.png";

	job_desc = {
		application : webapp_settings.app_id,
		description : job_usrdesc,
		arguments : job_arguments,
		output_files : [ "out.png" ],
		input_files : []
	};
	submit(job_desc);
	$('#enesModal').modal('toggle');
	$('.nav-tabs a[href="#status"]').tab('show');
}
/*
 * Page initialization
 */
$(document).ready(
		function() {
			$('#confirmDelete').on('show.bs.modal', function(e) {
				$message = $(e.relatedTarget).attr('data-message');
				$(this).find('.modal-body p').text($message);
				$title = $(e.relatedTarget).attr('data-title');
				$job_id = $(e.relatedTarget).attr('data-data');
				$(this).find('.modal-title').text($title);
				$('#job_id').attr('data-value', $job_id)
				$('#cancelJobDel').text('Cancel');
				$('#confirmJobDel').show();
			});
			// Form confirm (yes/ok) handler, submits form
			$('#confirmDelete').find('.modal-footer #confirmJobDel').on(
					'click', function(e) {
						$job_id = $('#job_id').attr('data-value');
						cleanJob($job_id);
					});
			prepareJobTable(); // Fills the job table
			setTimeout(checkJobs, TimerDelay); // Initialize the job check loop
			$("#percentile").slider({});
			$("#temporalScenario").slider({});
			$("#temporalHistorical").slider({});
			initMap();
		});

var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('spatialMap'), {
		center : {
			lat : 37.553593,
			lng : 15.068971
		},
		zoom : 2,
		draggable : false,
		disableDoubleClickZoom : true,
		scrollwheel : false,
		zoomControl : false,
		streetViewControl : false,
		keyboardShortcuts : false,
		mapTypeControl : false,
		overviewMapControl : false
	});
	var imageBounds = {
		north : 88.00000,
		south : -88.00000,
		east : 179.00000,
		west : -162.00000
	};

	historicalOverlay = new google.maps.GroundOverlay(
			context + '/images/BlackOverlay.png', imageBounds);
	historicalOverlay.setOpacity(0.5);
	historicalOverlay.setMap(map);
}
