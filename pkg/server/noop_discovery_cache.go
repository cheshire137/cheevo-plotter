package server

import "github.com/yohcop/openid-go"

type NoopDiscoveryCache struct{}

func (n *NoopDiscoveryCache) Put(id string, info openid.DiscoveredInfo) {}

func (n *NoopDiscoveryCache) Get(id string) openid.DiscoveredInfo {
	return nil
}
