function initMap(did) {
    // Google map variables
    var locations = [];
    var markers = [];
    var myLatlng = { lat: 7.566372605265147, lng: 80.74644779929662 };
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: myLatlng,
    });

    // Add new for division-wise map
    let urlMap = '/api/dashboard/getwarehousetbl';
    if (did) {
        urlMap += `?companycode=${did}`;
    }

    fetch(urlMap)
        .then(response => response.json())
        .then(data => {
            let completedLocations = data.completed;
            let startedLocations = data.started;
            let pendingLocations = data.pending;

            if (Array.isArray(completedLocations)) {
                completedLocations.forEach(location => {
                    locations.push([
                        'C-' + location.warehouseCode + '<br>' + location.warehouseName + '<br>View Location Details',
                        location.latitude,
                        location.longitude,
                        location.status
                    ]);
                });
            }

            if (Array.isArray(startedLocations)) {
                startedLocations.forEach(location => {
                    locations.push([
                        location.warehouseCode + '<br>' + location.warehouseName + '<br>View Location Details',
                        location.latitude,
                        location.longitude,
                        location.status
                    ]);
                });
            }

            if (Array.isArray(pendingLocations)) {
                pendingLocations.forEach(location => {
                    locations.push([
                        location.warehouseCode + '<br>' + location.warehouseName + '<br>View Location Details',
                        location.latitude,
                        location.longitude,
                        location.status
                    ]);
                });
            }

            var infowindow = new google.maps.InfoWindow({});
            var marker, count;
            var bounds = new google.maps.LatLngBounds();

            // Hide map if all locations are zero
            let zeroLocations = 0;
            for (count = 0; count < locations.length; count++) {
                if (locations[count][1] === 0 && locations[count][2] === 0) {
                    zeroLocations++;
                }
            }

            let tdcolw = document.getElementById("tdcolw");
            if (zeroLocations === locations.length) {
                document.getElementById("mapcol").style.display = "none";
                tdcolw.classList.remove("col-lg-12");
                tdcolw.classList.add("col-lg-9");
            } else {
                document.getElementById("mapcol").style.display = "block";
                tdcolw.classList.remove("col-lg-9");
                tdcolw.classList.add("col-lg-12");
            }

            for (count = 0; count < locations.length; count++) {
                let iconUrl;
                if (locations[count][3] === 'COMPLETED') {
                    iconUrl = 'images/completedm.png';
                } else if (locations[count][3] === 'PENDING') {
                    iconUrl = 'images/plannedm.png';
                } else {
                    iconUrl = 'images/active.gif';
                }

                if (locations[count][1] !== 0 && locations[count][2] !== 0) {
                    // Avoid empty or zero lat/long locations
                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(locations[count][1], locations[count][2]),
                        map: map,
                        title: locations[count][0],
                        icon: iconUrl
                    });

                    google.maps.event.addListener(marker, 'click', (function(marker, count) {
                        return function() {
                            infowindow.setContent(locations[count][0]);
                            infowindow.open(map, marker);
                        };
                    })(marker, count));

                    markers.push(marker);
                    bounds.extend(marker.getPosition());
                }
            }

            map.fitBounds(bounds);
        })
        .catch(error => console.error(error));
}

window.initMap = initMap;

function loadOffcanvas(event) {
    event.preventDefault();
    var dataId = event.target.getAttribute("data-id");
    var dataName = event.target.getAttribute("data-name");
    var dataStatus = event.target.getAttribute("data-status");
    var myOffcanvas = document.getElementById('offcanvasBottom');
    var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
    bsOffcanvas.show();

    var whCodedisplayHeading = document.getElementById("offcanvasBottomLabel");
    whCodedisplayHeading.innerHTML = dataId;
    var whCodedisplayHeadingName = document.getElementById("whNamedisplay");
    whCodedisplayHeadingName.innerHTML = dataName;
    var whStatusD = document.getElementById("statusLocation");
    whStatusD.innerHTML = dataStatus;

    eChartDisplay(dataId);
    getConsignmentData(dataId);
}

function getConsignmentData(dataId) {
    fetch('/api/dashboard/getconsignmentwarehouse?warehouseCode=' + dataId)
        .then(response => response.json())
        .then(data => {
            var isConsignment = data.nonConsignmentWarehouse.isConsignemnt;
            var nonConsignmentUsers = data.nonConsignmentUserViewModels;
            var consignmentUsers = data.consignmentUserViewModels;
            var nonConsignmentUsersList = "";
            var consignmentUsersList = "";

            if (!isConsignment) {
                nonConsignmentUsersList += "Non-consignment Location<br>User List:<br>";
                nonConsignmentUsers.forEach(user => {
                    nonConsignmentUsersList += `- ${user.fullName} (${user.roleName})<br>`;
                });
                document.getElementById('location-data').innerHTML = nonConsignmentUsersList;
            }

            if (consignmentUsers.length > 0) {
                consignmentUsersList += "Consignment Location<br>User List:<br>";
                consignmentUsers.forEach(user => {
                    consignmentUsersList += `- ${user.fullName} (${user.roleName})<br>`;
                });
                document.getElementById('location-data').innerHTML = consignmentUsersList;
            }
        })
        .catch(error => console.error(error));
}

function AllLocationsDisplayTable(did) {
    let urlAllT = '/api/dashboard/getwarehousetbl';
    if (did) {
        urlAllT += `?companycode=${did}`;
    }

    fetch(urlAllT)
        .then(response => response.json())
        .then(data => {
            var completedLocations = data.completed;
            var startedLocations = data.started;
            var pendingLocations = data.pending;

            // Populate completed locations table
            var tableBodycompleted = document.querySelector("#completedTable tbody");
            tableBodycompleted.innerHTML = "";
            completedLocations.forEach(location => {
                var tr = document.createElement("tr");
                var td1 = document.createElement("td");
                var td2 = document.createElement("td");
                var td5 = document.createElement("td");
                var td6 = document.createElement("td");
                td1.innerHTML = location.warehouseCode;
                td2.innerHTML = location.warehouseName;
                td5.innerHTML = location.status;
                td6.innerHTML = 'View Location Details';
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td5);
                tr.appendChild(td6);
                tableBodycompleted.appendChild(tr);
            });
            $('#completedTable').DataTable();

            // Populate started locations table
            var tableBodystarted = document.querySelector("#startedTable tbody");
            tableBodystarted.innerHTML = "";
            startedLocations.forEach(location => {
                var tr = document.createElement("tr");
                var td1 = document.createElement("td");
                var td2 = document.createElement("td");
                var td5 = document.createElement("td");
                var td6 = document.createElement("td");
                td1.innerHTML = location.warehouseCode;
                td2.innerHTML = location.warehouseName;
                td5.innerHTML = location.status;
                td6.innerHTML = 'View Location Details';
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td5);
                tr.appendChild(td6);
                tableBodystarted.appendChild(tr);
            });
            $('#startedTable').DataTable();

            // Populate pending locations table
            var tableBodypending = document.querySelector("#pendingTable tbody");
            tableBodypending.innerHTML = "";
            pendingLocations.forEach(location => {
                var tr = document.createElement("tr");
                var td1 = document.createElement("td");
                var td2 = document.createElement("td");
                var td5 = document.createElement("td");
                var td6 = document.createElement("td");
                td1.innerHTML = location.warehouseCode;
                td2.innerHTML = location.warehouseName;
                td5.innerHTML = location.status;
                td6.innerHTML = 'View Location Details';
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td5);
                tr.appendChild(td6);
                tableBodypending.appendChild(tr);
            });
            $('#pendingTable').DataTable();
        })
        .catch(error => console.error(error));
}

setInterval(function() {
    var selectD = document.querySelector("#companySelect");
    var selectedValue = selectD.value;
    AllLocationsDisplayTable(selectedValue);
}, 5000);

function eChartDisplay(dataId) {
    fetch('/api/dashboard/getvariancesbywarehouse/?warehouseCode=' + encodeURIComponent(dataId))
        .then(response => response.json())
        .then(({ varaince, nonVaraince, extras }) => {
            document.getElementById('varianceD').innerHTML = varaince;
            document.getElementById('novarianceD').innerHTML = nonVaraince;
            document.getElementById('extraD').innerHTML = extras;

            var dom = document.getElementById('chart-container');
            var myChart = echarts.init(dom, null, {
                renderer: 'canvas',
                useDirtyRect: false
            });
            var app = {};
            var option;
            var colorPalette = ['#FF5A49', '#2BD59C', '#E89B26'];
            option = {
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    top: '5%',
                    left: 'center'
                },
                series: [{
                    name: 'Access From',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    color: colorPalette,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 40,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [{
                            value: varaince,
                            name: 'Variance'
                        },
                        {
                            value: nonVaraince,
                            name: 'No Variance'
                        },
                        {
                            value: extras,
                            name: 'Extra Items'
                        }
                    ]
                }]
            };

            if (option && typeof option === 'object') {
                myChart.setOption(option);
            }

            window.addEventListener('resize', myChart.resize);
        })
        .catch(error => console.error(error));
}

setInterval(function() {
    var textbox = document.getElementById("textDate");
    var currentDate = new Date();
    var dateString = currentDate.toLocaleString();
    textbox.value = dateString;
}, 1000);

setInterval(function() {
    var sspan1 = document.getElementById("completedLocationsd");
    var sspan2 = document.getElementById("countingLocationsd");
    var sspan3 = document.getElementById("pLocationsd");

    var cvalue1 = parseFloat(sspan1.innerHTML.replace(/,/g, ''));
    var cvalue2 = parseFloat(sspan2.innerHTML.replace(/,/g, ''));
    var cvalue3 = parseFloat(sspan3.innerHTML.replace(/,/g, ''));

    var total = cvalue1 + cvalue2 + cvalue3;

    var cpercent1 = (cvalue1 / total) * 100;
    var cpercent2 = (cvalue2 / total) * 100;
    var cpercent3 = (cvalue3 / total) * 100;

    var pdiv1 = document.getElementById("progress1");
    var pdiv2 = document.getElementById("progress2");
    var pdiv3 = document.getElementById("progress3");

    pdiv1.style.width = cpercent1 + "%";
    pdiv2.style.width = cpercent2 + "%";
    pdiv3.style.width = cpercent3 + "%";
}, 5000);

var allLocationsd = document.getElementById("allLocationsd");
var completedLocationsd = document.getElementById("completedLocationsd");
var countingLocationsd = document.getElementById("countingLocationsd");
var pLocationsd = document.getElementById("pLocationsd");

function updateData(did) {
    let urlAll = '/api/dashboard/getwarehousecount';
    if (did) {
        urlAll += `?companycode=${did}`;
    }

    fetch(urlAll)
        .then(response => response.json())
        .then(data => {
            allLocationsd.innerHTML = JSON.stringify(data);
        })
        .catch(error => console.error(error));

    let urlCompleted = '/api/dashboard/getwarehousecompleted';
    if (did) {
        urlCompleted += `?companycode=${did}`;
    }

    fetch(urlCompleted)
        .then(response => response.json())
        .then(data => {
            completedLocationsd.innerHTML = JSON.stringify(data);
        })
        .catch(error => console.error(error));

    let urlStarted = '/api/dashboard/getwarehousetarted';
    if (did) {
        urlStarted += `?companycode=${did}`;
    }

    fetch(urlStarted)
        .then(response => response.json())
        .then(data => {
            countingLocationsd.innerHTML = JSON.stringify(data);
        })
        .catch(error => console.error(error));

    let urlPending = '/api/dashboard/getwarehousepending';
    if (did) {
        urlPending += `?companycode=${did}`;
    }

    fetch(urlPending)
        .then(response => response.json())
        .then(data => {
            pLocationsd.innerHTML = JSON.stringify(data);
        })
        .catch(error => console.error(error));
}

setInterval(function() {
    var selectD = document.querySelector("#companySelect");
    var selectedValue = selectD.value;
    updateData(selectedValue);
}, 5000);

function bindCompanyData() {
    fetch("/api/dashboard/getdivisions")
        .then(response => response.json())
        .then(data => {
            var select = document.querySelector("#companySelect");
            data.forEach(item => {
                var option = document.createElement("option");
                option.text = item.companyDescription;
                option.value = item.companyCode;
                select.appendChild(option);
            });
        });
}

bindCompanyData();

var selectD = document.querySelector("#companySelect");
selectD.addEventListener("change", function() {
    var selectedValue = selectD.value;
    if (!selectedValue) {
        location.reload();
        return;
    } else {
        // Clear tables
        var tableBodycompleted = document.querySelector("#completedTable tbody");
        tableBodycompleted.innerHTML = "";
        var tableBodystarted = document.querySelector("#startedTable tbody");
        tableBodystarted.innerHTML = "";
        var tableBodypending = document.querySelector("#pendingTable tbody");
        tableBodypending.innerHTML = "";

        if ($('#startedTable').length) {
            $('#startedTable').DataTable().destroy();
        }
        if ($('#pendingTable').length) {
            $('#pendingTable').DataTable().destroy();
        }
        if ($('#completedTable').length) {
            $('#completedTable').DataTable().destroy();
        }

        // Call functions
        updateData(selectedValue);
        initMap(selectedValue);
        AllLocationsDisplayTable(selectedValue);
    }
});

feather.replace();
