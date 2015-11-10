<%--
 Copyright (c) 2015:
 Istituto Nazionale di Fisica Nucleare (INFN), Italy

 See http://www.infn.it and and http://www.consorzio-cometa.it for details on
 the copyright holders.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

--%>

<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet"%>
<%@ taglib uri="http://liferay.com/tld/theme" prefix="theme" %>

<theme:defineObjects />
<portlet:defineObjects />

<script type="text/javascript">
	/*
	 * All the web app needs to configure are the following
	 */
	var webapp_settings = {
		apiserver_base_url : 'https://sgw.indigo-datacloud.eu/apis/v1.0',
		username : '<%= user.getScreenName() %>',
		app_id : 3
	};
	/*
	 * Change variable below to change delay of check status loop
	 */
	var TimerDelay = 15000;
	
	var context = '<%=request.getContextPath()%>';
		
</script>
<ul class="nav nav-tabs nav-pills" role="tablist">
	<li role="presentation" class="active"><a href="#submit"
		role="tab" data-toggle="pill">Submit</a></li>
	<li role="presentation"><a href="#status" role="tab"
		data-toggle="pill">Status</a></li>
</ul>
<div class="tab-content">
	<div role="tabpanel" class="tab-pane active in fade" id="submit">
		<div class="container">
			<div class="row">
				<div class="col-md-4">
					<div class="row">
						<div class="col-md-12">
							<div class="form-group">
								<label for="analysis">Analysis</label> <select id="analysis"
									class="form-control">
									<option value="Trend analysis">Trend analysis</option>
									<option value="Anomalies analysis" disabled="disabled">Anomalies analysis</option>
									<option value="Climate change signal analysis" disabled="disabled">Climate change signal analysis</option>
								</select>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-md-12">
							<div class="form-group">
								<label for="model">Model</label> <select id="model"
									class="form-control">
									<option>CMCC-CM</option>
								</select>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-md-12">
							<div class="form-group">
								<label for="scenario">Scenario</label>
								<select id="scenario"
									class="form-control">
									<option value="rcp85">RCP8.5</option>
									<option value="rcp45" disabled="disabled">RCP4.5</option>
								</select>
							</div>
						</div>						
					</div>
					<div class="row">
						<div class="col-md-12">
							<div class="form-group">
								<label for="frequency">Frequency</label>
								<select id="frequency"
									class="form-control">
									<option>day</option>
									<option>6h</option>
									<option>3h</option>
								</select>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-md-12">
							<div class="form-group">
								<label for="percentile">Percentile</label> <input
									id="percentile" data-slider-id='percentileSlider' type="text"
									data-slider-min="0" data-slider-max="100" data-slider-step="1"
									data-slider-value="50" />
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-md-12">
							<div class="row">
								<div class="col-md-12">
									<h3>Temporal Subset</h3>
								</div>
							</div>
							<div class="row">
								<div class="col-md-12">
									<div class="form-group">
										<label for="temporalScenario">Scenario</label> <input
											id="temporalScenario"
											data-slider-id='temporalScenario1Slider' type="text"
											data-slider-min="2071" data-slider-max="2100"
											data-slider-step="1" data-slider-value="[2080,2090]" />
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col-md-12">
									<div class="form-group">
										<label for="temporalHistorical">Historical</label> <input
											id="temporalHistorical"
											data-slider-id='temporalHistorical1Slider' type="text"
											data-slider-min="1976" data-slider-max="2005"
											data-slider-step="1" data-slider-value="[1985,1995]" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-7">
					<div class="row">
						<div class="col-md12">
							<div class="radio">
								<label>
									<input type="radio" name="subset" id="subset1" value="global" checked/>
									Global
								</label>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-md12">
							<div class="radio">
								<label>
									<input type="radio" name="subset" id="subset2" value="spatial" disabled/>
									Spatial subset
								</label>
							</div>
						</div>
					</div>

					<div class="row">
						<div class="col-md12">
							<div id="spatialMap"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-7"></div>
				<div class="col-md-4">
					<button type="button" class="btn btn-primary btn-lg" id="openmodal"
						onClick="openModal()">Run the analysis</button>
				</div>
			</div>
		</div>

		<!-- Submit record table (end) -->
		<!-- Modal (begin) -->
		<div class="modal fade" id="enesModal" tabindex="-1"
			role="dialog" aria-labelledby="HelloTester">
			<div class="modal-dialog modal-lg" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal"
							aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
						<h4 class="modal-title" id="myModalLabel">Application
							submission</h4>
					</div>
					<div class="modal-body">
						<h5>Application parameters summary</h5>
						<ul class="list-group">
							<li class="list-group-item"><b>Analysis:</b> <i id="recap-analysis"></i></li>
							<li class="list-group-item"><b>Model:</b> <i id="recap-model"></i></li>
							<li class="list-group-item"><b>Scenario:</b> <i id="recap-scenario"></i></li>
							<li class="list-group-item"><b>Frequency:</b> <i id="recap-frequency"></i></li>
							<li class="list-group-item"><b>Percentile:</b> <i id="recap-percentile"></i></li>
							<li class="list-group-item"><b>Temporal Subset Scenario:</b> <i id="recap-temporalScenario"></i></li>
							<li class="list-group-item"><b>Temporal Subset Historical:</b> <i id="recap-temporalHistorical"></i></li>
							<li class="list-group-item"><b>Spatial Subset:</b> <i id="recap-spatial"></i></li>
						</ul>
						<p>
							<b>Specify your job identifier: </b> <input type="text"
								id="jobDescription" size="60" />
						</p>
						<!-- This is not shown properly
                <div class="modal-content" id="modal-content">
                </div>
                -->
					</div>
					<div class="modal-footer centre-footer">
							<button type="button" class="btn btn-default"
								data-dismiss="modal">Cancel</button>
							<button type="button" class="btn btn-primary"
								onClick="submitJob()" id="submitButton">Submit</button>
					</div>
				</div>
			</div>
		</div>
		<!-- Modal (end) -->
	</div>
	<div role="tabpanel" class="tab-pane fade" id="status">
		<!-- Submit record table (begin) -->
		<div id="jobsDiv" data-modify="false"></div>
		
		<!-- Confirm Modal Dialog (begin) -->

		<div class="modal fade" id="confirmDelete" role="dialog" tabindex="-1"
			aria-labelledby="confirmDeleteLabel">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal"
							aria-hidden="true">&times;</button>
						<h4 class="modal-title">Delete Parmanently</h4>
					</div>
					<div class="modal-body">
						<p></p>
					</div>
					<div id="job_id" class='job_id' data-name='job_id' data-value=''></div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal"
							id="cancelJobDel">Cancel</button>
						<button type="button" class="btn btn-danger" id="confirmJobDel">Delete</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
