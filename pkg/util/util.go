package util

import (
	"fmt"
	"net/http"
)

func LogInfo(format string, a ...interface{}) {
	fmt.Printf("ℹ️ "+format+"\n", a...)
}

func LogSuccess(format string, a ...interface{}) {
	fmt.Printf("✅ "+format+"\n", a...)
}

func LogError(a ...interface{}) {
	fmt.Print("❌ ")
	fmt.Println(a...)
}

func LogRequest(r *http.Request) {
	queryStr := r.URL.RawQuery
	if len(r.URL.Scheme) > 0 && len(r.URL.Host) > 0 {
		LogInfo("%s %s://%s%s", r.Method, r.URL.Scheme, r.URL.Host, r.URL.Path)
	} else {
		LogInfo("%s %s", r.Method, r.URL.Path)
	}
	if queryStr != "" {
		params := r.URL.Query()
		i := 0
		for key, values := range params {
			for _, value := range values {
				joiner := "?"
				if i > 0 {
					joiner = "&"
				}
				LogInfo("  %s%s=%s", joiner, key, value)
				i++
			}
		}
	}
}

// InspectMap recursively inspects a map and prints field names, values, and types
func InspectMap(m map[string]interface{}, prefix string) {
	for key, value := range m {
		fieldPath := prefix + key
		valueType := fmt.Sprintf("%T", value)

		switch v := value.(type) {
		case map[string]interface{}:
			LogInfo("%s: %s (nested object)", fieldPath, valueType)
			InspectMap(v, fieldPath+".")
		case []interface{}:
			LogInfo("%s: %s (array with %d elements)", fieldPath, valueType, len(v))
			if len(v) > 0 {
				// Inspect first element of array
				if elemMap, ok := v[0].(map[string]interface{}); ok {
					LogInfo("%s[0]: map[string]interface {} (nested object)", fieldPath)
					InspectMap(elemMap, fieldPath+"[0].")
				} else {
					LogInfo("%s[0]: %T = %v", fieldPath, v[0], v[0])
				}
			}
		case nil:
			LogInfo("%s: %s = null", fieldPath, valueType)
		case string:
			if len(v) > 100 {
				LogInfo("%s: %s = %q... (truncated, length: %d)", fieldPath, valueType, v[:100], len(v))
			} else {
				LogInfo("%s: %s = %q", fieldPath, valueType, v)
			}
		case float64, bool, int:
			LogInfo("%s: %s = %v", fieldPath, valueType, v)
		default:
			LogInfo("%s: %s = %v", fieldPath, valueType, v)
		}
	}
}
