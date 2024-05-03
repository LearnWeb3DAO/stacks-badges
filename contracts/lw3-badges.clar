
;; title: lw3-badges
;; version: 1
;; summary: Contract for minting LearnWeb3 badges on Stacks

;; traits
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; token definitions
(define-non-fungible-token lw3-badges uint)

;; constants
(define-constant base-uri "https://learnweb3.io/api/tokens/stx/")

(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-non-transferable (err u102))

;; data vars
(define-data-var contract-owner principal tx-sender)
(define-data-var last-token-id uint u0)

;; public functions
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    ;; LearnWeb3 badges are non-transferable
    err-non-transferable
)

(define-public (mint (recipient principal))
    (let
        ((token-id (+ (var-get last-token-id) u1)))
        (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
        (try! (nft-mint? lw3-badges token-id recipient))
        (var-set last-token-id token-id)
        (ok token-id)
    )
)

(define-public (batch-mint (recipients (list 1000 principal))) 
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
        (map mint recipients) 
        (ok true)
    )
)

(define-public (set-contract-owner (new-owner principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) err-owner-only)
        (ok (var-set contract-owner new-owner))
    )
)

;; read only functions
(define-read-only (get-last-token-id) 
    (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint)) 
    (ok (some (concat base-uri (int-to-ascii token-id))))
)

(define-read-only (get-owner (token-id uint)) 
    (ok (nft-get-owner? lw3-badges token-id))
)
