angular.module("acuerdosApp", ['ngRoute', 'ui.bootstrap', 'ngFileUpload', 'pdf', 'ui.calendar'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "acuerdos.html",
                controller: "homeController"
            })
            .when("/acuerdos", {
                templateUrl: "acuerdos.html",
                controller: "acuerdosController",
                resolve: {
                    acuerdos: function(ServiceAcuerdos) {
                        return ServiceAcuerdos.getAcuerdos();
                    }
                }

            })
            .when("/acuerdos/nuevo", {
                templateUrl: "altaAcuerdo.html",
                controller: "altaAcuerdoController"
            })
            .when("/acuerdos/:id", {
                templateUrl: "editAcuerdo.html",
                controller: "editAcuerdoController",
                resolve: {
                    acuerdo: function($route, ServiceAcuerdos) { // use $route instead $routeProvider
                        return ServiceAcuerdos.getAcuerdo($route.current.params.id);
                    }
                }
            })
            .when("/calendario", {
                templateUrl: "calendario.html",
                controller: "calendarioController",
                resolve: {
                    terminos: function(ServiceAcuerdos) {
                        return ServiceAcuerdos.getTerminos();
                    }
                }
            })
            .when("/register", {
                templateUrl: "register.html",
                controller: "registerController"
            })
            .when("/login", {
                templateUrl: "login.html",
                controller: "loginController"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .factory("AuthData", function() {
        var user = {
            username: "JIL",
            token: ""
        }
        return {
            getusername: function() {
                return user.username;
            },
            setUsername: function(username) {
                user.username = username;
            },
            getToken: function() {
                return user.token;
            },
            setToken: function(token) {
                user.token = token;
            }
        }
    })
    .service("ServiceAcuerdos", function($http) {
        // GET ALL acuerdos
        this.getAcuerdos = function() {
                return $http.get("/apiv1/acuerdos").
                then(function(response) {
                    return response;
                }, function(err) {
                    alert("No se encontró el elemento:" + err);
                });
            }
            // GET a single acuerdo
        this.getAcuerdo = function(id) {
                return $http.get("/apiv1/acuerdos/" + id).
                then(function(response) {
                    return response;
                }, function(err) {
                    alert("No se encontró el elemento: " + id);
                })
            }
            // Get acuerdo as well as file
        this.getAcuerdov1 = function(id) {
            return $http.get("/apiv1/acuerdos/" + id).
            then(function(response) {
                return response;
            }, function(err) {
                alert("No se encontró el elemento: " + id);
            })
        }
        this.getAcuerdoAttachment = function(id) {
                return $http.get("/apiv1/download/" + id + ".pdf", {
                    responseType: 'arraybuffer'
                }).
                then(function(response) {
                    return response;
                }, function(err) {
                    alert("No se pudo descargar el PDF");
                })
            }
            // POST Acuerdo
        this.createAcuerdo = function(jsonData) {
            return $http.post('/apiv1/acuerdos', jsonData).
            then(function(response) {
                return response;
            }, function(err) {
                alert("No se pudo realizar la petición POST" + err)
            })
        }
        this.editAcuerdo = function(jsonData) {
            console.log(jsonData);
            return $http.post('/apiv1/acuerdos/' + jsonData.slug, jsonData).
            then(function(response) {
                return response;
            }, function(err) {
                alert("No se pudo realizar la petición Post" + err)
            })
        }
        this.getTerminos = function() {
            return $http.get("/apiv1/acuerdos").
            then(function(response) {
                var acuerdosArray = response.data;
                var terminosArray = [];

                for (i = 0; i < acuerdosArray.length; i++) {
                    var terminosAux = acuerdosArray[i].terminos;
                    for (j = 0; j < terminosAux.length; j++) {
                        var aux = {
                            title: acuerdosArray[i].slug,
                            start: terminosAux[j].fecha_termino,
                            allDay: true,
                            url: "/#/acuerdos/" + acuerdosArray[i].slug
                        }
                        terminosArray.push(aux);
                    }
                }
                console.log(terminosArray)
                return terminosArray;
            }, function(err) {
                alert("No se encontró el elemento:" + err);
            });
        }
        this.saveUser = function(jsonData) {
            return $http.post("/apiv1/register", jsonData).
            then(function(response) {
                return response;
            }, function(err) {
                alert("No se pudo dar de alta");
            })
        }
        this.authenticateUser = function(jsonData) {
            return $http.post("/apiv1/authenticate", jsonData).
            then(function(response) {
                return response;
            }, function(err) {
                alert("Error en la autenticación");
            })
        }
    })
    .controller("loginController", function($scope, $window, ServiceAcuerdos, AuthData) {
        $scope.user = {};

        $scope.authenticateUser = function() {
            ServiceAcuerdos.authenticateUser($scope.user).
            then(function(resp) {
                //console.log(resp.data.username);
                AuthData.setUsername(resp.data.username);
                AuthData.setToken(resp.data.token);
                $window.location.href = "/#/acuerdos"
            }, function(err) {
                console.log("Fail Authenticate");
            })
        }
    })
    .controller("registerController", function($scope, ServiceAcuerdos, $window) {
        $scope.user = {};

        $scope.saveUser = function() {
            ServiceAcuerdos.saveUser($scope.user).
            then(function(resp) {
                console.log("SaveUser Success");
                console.log(resp);
                $window.location.href = '/#/login'
            }, function(err) {
                console.log("SaveUser Fail");
            })
        }
    })
    .controller("homeController", function($scope) {
        $scope.cat = "Holi hooe";
    })
    .controller("acuerdosController", function(acuerdos, $scope) {
        $scope.acuerdos = acuerdos.data;
    })
    .controller("editAcuerdoController", function($scope, $routeParams, $sce, acuerdo, AuthData, ServiceAcuerdos) {
        $scope.acuerdo = acuerdo.data;
        $scope.comentario = "";
        $scope.activeUsername = AuthData.getusername();
        // Cast the String Date to a valid JavaScript Date Object
        $scope.acuerdo.publ_boletin = new Date($scope.acuerdo.publ_boletin)
        $scope.acuerdo.surte_efectos = new Date($scope.acuerdo.surte_efectos)
        $scope.pdfAttachment;

        console.log($scope.acuerdo);

        if (typeof $scope.acuerdo.comentarios == 'undefined') {
            $scope.acuerdo.comentarios = [];
        }

        for (i = 0; i < $scope.acuerdo.terminos.length; i++) {
            $scope.acuerdo.terminos[i].fecha_termino = new Date($scope.acuerdo.terminos[i].fecha_termino);
        };

        $scope.addComment = function() {
            $scope.acuerdo.comentarios.push({
                username: AuthData.getusername(),
                comentario: $scope.comentario,
                fecha_comentario: new Date()
            });
            console.log($scope.acuerdo);
        }


        $scope.saveComments = function() {
            ServiceAcuerdos.editAcuerdo($scope.acuerdo).
            then(function(resp) {
                console.log("Edit Acuerdo");
                console.log(resp);
            }, function(err) {
                console.log(err);
            })
        }

        $scope.aprobar = function() {
            $scope.acuerdo.revisado_por.push({
                email: AuthData.getusername(),
                fecha_rev: new Date()
            });
            ServiceAcuerdos.editAcuerdo($scope.acuerdo).
            then(function(resp) {
                console.log("Edit Acuerdo");
                console.log(resp);
            }, function(err) {
                console.log(err);
            })
        }
        $scope.getPDF = function() {
            ServiceAcuerdos.getAcuerdoAttachment($scope.acuerdo.filename).
            then(function(resp) {
                $scope.pdfAttachment = resp.data;
                currentBlob = new Blob([$scope.pdfAttachment], {
                    type: 'application/pdf'
                });
                $scope.pdfUrl = URL.createObjectURL(currentBlob);
                $scope.content = $sce.trustAsResourceUrl($scope.pdfUrl);
                console.log(currentBlob.size);
                console.log(currentBlob.type);
                console.log("Se descargo el PDF con éxito");
            }, function(err) {
                console.log("No se descargo el PDF con éxito");
            })
        }
    })
    .controller("calendarioController", function($scope, terminos, uiCalendarConfig) {
        $scope.terminos = terminos;
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        $scope.eventSources = [$scope.terminos];

        // Calendar Options
        $scope.uiConfig = {
            calendar: {
                height: 600,
                editable: true,
                header: {
                    left: 'title',
                    center: '',
                    right: 'today prev,next'
                }
            }
        }
    })
    .controller("altaAcuerdoController", function($scope, $filter, $sce, ServiceAcuerdos, $window, Upload, AuthData) {
        $scope.tipos_not = ["Listado", "Presencial"];

        // JSON document
        $scope.acuerdo = {
            slug: "",
            actor: "",
            demandado: "",
            juzgado: "",
            expediente: "",
            juicio: "",
            publ_boletin: "",
            tipo_not: "",
            surte_efectos: "",
            terminos: [],
            creado_por: AuthData.getusername(),
            revisado_por: [{
                email: AuthData.getusername(),
                fecha_rev: new Date()
            }],
            fecha_creacion: new Date(),
            attachmentURL: ""
        }

        // File upload
        $scope.attachment;
        currentBlob = new Blob([$scope.attachment], {
            type: 'application/pdf'
        });
        $scope.pdfUrl = URL.createObjectURL(currentBlob);

        //$scope.pdfContent = $sce.trustAsResourceUrl($scope.pdfUrl);

        // Add more textBox to the Acuerdos JSON
        $scope.addMore = function() {
            $scope.acuerdo.terminos.push({
                textBox: ""
            });
        }

        $scope.saveAcuerdov1 = function() {
            $scope.acuerdo.slug = $scope.acuerdo.expediente + '-' + $filter('date')($scope.acuerdo.publ_boletin, 'ddMMyyyy');
            Upload.upload({
                url: "/apiv1/acuerdos",
                data: {
                    file: $scope.attachment,
                    otherData: angular.copy($scope.acuerdo)
                }
            }).then(function(resp) {
                if (resp.status === 201) {
                    console.log("Succesfull POST operation: " + resp);
                    $window.location.href = '/#/acuerdos'
                } else {
                    console.log(resp);
                }
            }, function(resp) {
                console.log("2. " + resp)
            })
        }
    });
