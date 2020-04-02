package transforms

import (
	"encoding/binary"
	"log"

	"github.com/raff/goble"
	"github.com/raff/goble/xpc"
)

func BuildFeatures(characteristic goble.ServiceCharacteristic) {

	log.Printf("buildFeatures for: %#v\n", characteristic)

	cuuid := xpc.MustUUID(characteristic.Uuid)

	log.Printf("chararcteristic uuid: %v\n", cuuid)

	log.Printf("chararcteristic uuid: %16b\n", cuuid)

	msb32 := extractFeatureMask(cuuid)

	log.Printf("chararcteristic uuid int: %v\n", msb32)

}

func extractFeatureMask(uuid xpc.UUID) int {
	var b [8]byte
	b[4] = uuid[0]
	b[5] = uuid[1]
	b[6] = uuid[2]
	b[7] = uuid[3]
	//copy(b[4:], uuid)
	return int(binary.BigEndian.Uint64(b[:]))
}
