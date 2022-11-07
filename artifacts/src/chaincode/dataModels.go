package main

import (
	"time"
)

const bidKeyType = "bid"
const orderKeyType = "order"
const parcelKeyType = "parcel"
const orderCollection = "orderCollection"
const parcelCollection = "parcelCollection"

type Parcel struct {
	Type        string `json:"objectType"`
	ParcelID    string `json:"parcelID"`
	SellerOrg   string `json:"sellerOrg"`
	Seller      string `json:"seller"`
	Customer    string `json:"customer"`
	ShipDate    string `json:"shipdate"`
	Destination string `json:"destination"`
	State       string `json:"state"`
}

type ShippingOrder struct {
	Type             string             `json:"objectType"`
	OrderID          string             `json:"orderID"`
	MinRep           float64            `json:"minRep"`
	PickupDate       string             `json:"pickupDate"`
	PickupLocation   string             `json:"pickupLocation"`   //Not exact location
	ShippingLocation string             `json:"shippingLocation"` //Not exact location
	Orgs             []string           `json:"organizations"`
	PrivateBids      map[string]BidHash `json:"privateBids"`
	RevealedBids     map[string]FullBid `json:"revealedBids"`
	BidState         string             `json:"bidState"`
}
type ShippingOrderPrivateDetails struct {
	Type         string    `json:"objectType"`
	OrderID      string    `json:"orderID"`
	OrderDate    time.Time `json:"orderDate"`
	ParcelID     string    `json:"parcelID"`
	Seller       string    `json:"seller"`
	Courier      string    `json:"courier"`
	ShippingCost int       `json:"shippingCost"`
	OrderState   string    `json:"orderState"`
}

// FullBid is the structure of a revealed bid
type FullBid struct {
	Type    string `json:"objectType"`
	Price   int    `json:"price"`
	Org     string `json:"org"`
	Courier string `json:"courier"`
}

// BidHash is the structure of a private bid
type BidHash struct {
	Org  string `json:"org"`
	Hash string `json:"hash"`
}
