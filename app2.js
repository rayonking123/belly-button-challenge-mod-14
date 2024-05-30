document.addEventListener("DOMContentLoaded", function() {
    const jsonUrl = "https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json";

    function fetchJsonData(url, callback) {
        d3.json(url).then(callback);
    }

    function populateDropdown(data) {
        const dropdown = d3.select("#selDataset");
        data.samples.forEach(sample => {
            dropdown.append("option").attr("value", sample.id).text(sample.id);
        });
        dropdown.on("change", function() {
            const selectedId = d3.select(this).property("value");
            refreshCharts(selectedId);
        });
    }

    function refreshCharts(sampleId) {
        fetchJsonData(jsonUrl, function(data) {
            const samples = data.samples;
            const metadata = data.metadata;
            const selectedSample = samples.find(sample => sample.id === sampleId);

            updateBarChart(selectedSample);
            updateDemographics(metadata, sampleId);
            updateBubbleChart(selectedSample);
        });
    }

    function updateBarChart(sample) {
        const top10Values = sample.sample_values.slice(0, 10);
        const top10Ids = sample.otu_ids.slice(0, 10).map(id => `OTU ${id}`);
        const top10Labels = sample.otu_labels.slice(0, 10);

        const barData = [{
            x: top10Values,
            y: top10Ids,
            text: top10Labels,
            type: "bar",
            orientation: "h"
        }];

        const layout = {
            title: "Top 10 OTUs",
            xaxis: { title: "Sample Values" },
            yaxis: { title: "OTU ID" }
        };

        Plotly.newPlot("bar", barData, layout);
    }

    function updateDemographics(metadata, sampleId) {
        const demographicInfo = metadata.find(meta => meta.id === +sampleId);
        const demographicDiv = d3.select("#sample-metadata");
        demographicDiv.html("");

        if (demographicInfo) {
            Object.entries(demographicInfo).forEach(([key, value]) => {
                demographicDiv.append("p").text(`${key}: ${value}`);
            });
        }
    }

    function updateBubbleChart(sample) {
        const bubbleData = [{
            x: sample.otu_ids,
            y: sample.sample_values,
            text: sample.otu_labels,
            mode: 'markers',
            marker: {
                size: sample.sample_values,
                color: sample.otu_ids,
                colorscale: 'Earth',
                opacity: 0.9
            }
        }];

        const layout = {
            xaxis: { title: 'OTU ID' }
        };

        Plotly.newPlot('bubble', bubbleData, layout);
    }

    fetchJsonData(jsonUrl, function(data) {
        populateDropdown(data);
        const firstSample = data.samples[0].id;
        refreshCharts(firstSample);
    });
});

function optionChanged(selectedSample) {
    refreshCharts(selectedSample);
}
