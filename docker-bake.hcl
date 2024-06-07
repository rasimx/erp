group "default" {
  targets = ["app"]
}

target "app" {
  dockerfile = "Dockerfile"
  target = "app"
  tags = ["192.168.0.2:5000/erp:1.0.0"]
}

