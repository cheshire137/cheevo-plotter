package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	DatabaseFile string `yaml:"database_file"`
	BackendPort  int    `yaml:"backend_port"`
	FrontendPort int    `yaml:"frontend_port"`
	SteamApiKey  string `yaml:"steam_api_key"`
}

func NewConfig(path string) (*Config, error) {
	var config Config
	err := ReadConfig(path, &config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func ReadConfig(path string, config *Config) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()
	decoder := yaml.NewDecoder(file)
	return decoder.Decode(config)
}

func (c *Config) BackendAddress() string {
	return fmt.Sprintf(":%d", c.BackendPort)
}
