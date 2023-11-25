/**
 * This is the root document object of the OpenAPI document.
 */
export interface OpenAPIObject {
    /**
     * REQUIRED. This string MUST be the semantic version number
     * of the OpenAPI Specification version that the OpenAPI document uses.
     * The openapi field SHOULD be used by tooling specifications and clients
     * to interpret the OpenAPI document. This is not related to the API info.version string.
     */
    openapi: string;

    /**
     * REQUIRED. Provides metadata about the API. The metadata MAY be used by tooling as required.
     */
    info: InfoObject;

    /**
     * An array of Server Objects, which provide connectivity information
     * to a target server. If the servers property is not provided, or is an empty array,
     * the default value would be a Server Object with a url value of /.
     */
    servers?: ServerObject[];

    /**
     * REQUIRED. The available paths and operations for the API.
     */
    paths: PathsObject;

    /**
     * An element to hold various schemas for the specification.
     */
    components?: ComponentsObject;

    /**
     * A declaration of which security mechanisms can be used across the API.
     * The list of values includes alternative security requirement objects that can be used.
     * Only one of the security requirement objects need to be satisfied to authorize a request.
     * Individual operations can override this definition. To make security optional,
     * an empty security requirement ({}) can be included in the array.
     */
    security?: SecurityRequirementObject[];

    /**
     * A list of tags used by the specification with additional metadata.
     * The order of the tags can be used to reflect on their order by the parsing tools.
     * Not all tags that are used by the Operation Object must be declared.
     * The tags that are not declared MAY be organized randomly or based on the tools’ logic.
     * Each tag name in the list MUST be unique.
     */
    tags?: TagObject[];

    /**
     * Additional external documentation.
     */
    externalDocs?: ExternalDocumentationObject;
}

/**
 * Info Object provides metadata about the API.
 * The metadata MAY be used by the clients if needed, and MAY be presented
 * in editing or documentation generation tools for convenience.
 */
export interface InfoObject {
    /**
     * REQUIRED. The title of the API.
     */
    title: string;

    /**
     * A short description of the API.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * A URL to the Terms of Service for the API. MUST be in the format of a URL.
     */
    termsOfService?: string;

    /**
     * The contact information for the exposed API.
     */
    contact?: ContactObject;

    /**
     * The license information for the exposed API.
     */
    license?: LicenseObject;

    /**
     * REQUIRED. The version of the OpenAPI document
     * (which is distinct from the OpenAPI Specification version or the API implementation version).
     */
    version: string;
}

/**
 * Contact Object provides contact information for the exposed API.
 */
export interface ContactObject {
    /**
     * The identifying name of the contact person/organization.
     */
    name?: string;

    /**
     * The URL pointing to the contact information. MUST be in the format of a URL.
     */
    url?: string;

    /**
     * The email address of the contact person/organization. MUST be in the format of an email address.
     */
    email?: string;
}

/**
 * License Object provides license information for the exposed API.
 */
export interface LicenseObject {
    /**
     * REQUIRED. The license name used for the API.
     */
    name: string;

    /**
     * A URL to the license used for the API. MUST be in the format of a URL.
     */
    url?: string;
}

/**
 * Server Object represents a Server.
 */
export interface ServerObject {
    /**
     * REQUIRED. A URL to the target host. This URL supports Server Variables
     * and MAY be relative, to indicate that the host location is relative
     * to the location where the OpenAPI document is being served.
     * Variable substitutions will be made when a variable is named in {brackets}.
     */
    url: string;

    /**
     * An optional string describing the host designated by the URL.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * A map between a variable name and its value.
     * The value is used for substitution in the server’s URL template.
     */
    variables?: Record<string, ServerVariableObject>;
}

/**
 * Server Variable Object represents a Server Variable for server URL template substitution.
 */
export interface ServerVariableObject {
    /**
     * An enumeration of string values to be used if the substitution options
     * are from a limited set. The array SHOULD NOT be empty.
     */
    enum?: string[];

    /**
     * REQUIRED. The default value to use for substitution, which SHALL be sent
     * if an alternate value is not supplied. Note this behavior is different
     * than the Schema Object’s treatment of default values because in those cases
     * parameter values are optional. If the enum is defined, the value SHOULD
     * exist in the enum’s values.
     */
    default: string;

    /**
     * An optional description for the server variable.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;
}

/**
 * Components Object holds a set of reusable objects for different aspects of the OAS.
 * All objects defined within the components object will have no effect on the API
 * unless they are explicitly referenced from properties outside the components object.
 */
export interface ComponentsObject {
    /**
     * An object to hold reusable Schema Objects.
     */
    schemas?: Record<string, SchemaObject | ReferenceObject>;

    /**
     * An object to hold reusable Response Objects.
     */
    responses?: Record<string, ResponseObject | ReferenceObject>;

    /**
     * An object to hold reusable Parameter Objects.
     */
    parameters?: Record<string, ParameterObject | ReferenceObject>;

    /**
     * An object to hold reusable Example Objects.
     */
    examples?: Record<string, ExampleObject | ReferenceObject>;

    /**
     * An object to hold reusable Request Body Objects.
     */
    requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;

    /**
     * An object to hold reusable Header Objects.
     */
    headers?: Record<string, HeaderObject | ReferenceObject>;

    /**
     * An object to hold reusable Security Scheme Objects.
     */
    securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;

    /**
     * An object to hold reusable Link Objects.
     */
    links?: Record<string, LinkObject | ReferenceObject>;

    /**
     * An object to hold reusable Callback Objects.
     */
    callbacks?: Record<string, CallbackObject | ReferenceObject>;
}

/**
 * Paths Object holds the relative paths to the individual endpoints and their operations.
 * The Paths MAY be empty, due to ACL constraints.
 */
export interface PathsObject {
    /**
     * Patterned Fields represent relative paths to individual endpoints.
     * The field name MUST begin with a forward slash (/).
     * Path templating is allowed. When matching URLs, concrete (non-templated) paths
     * would be matched before their templated counterparts.
     */
    [path: string]: PathItemObject;
}

/**
 * Path Item Object describes the operations available on a single path.
 * A Path Item MAY be empty, due to ACL constraints.
 */
export interface PathItemObject {
    /**
     * Allows for an external definition of this path item.
     * The referenced structure MUST be in the format of a Path Item Object.
     */
    $ref?: string;

    /**
     * An optional, string summary, intended to apply to all operations in this path.
     */
    summary?: string;

    /**
     * An optional, string description, intended to apply to all operations in this path.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * A definition of a GET operation on this path.
     */
    get?: OperationObject;

    /**
     * A definition of a PUT operation on this path.
     */
    put?: OperationObject;

    /**
     * A definition of a POST operation on this path.
     */
    post?: OperationObject;

    /**
     * A definition of a DELETE operation on this path.
     */
    delete?: OperationObject;

    /**
     * A definition of an OPTIONS operation on this path.
     */
    options?: OperationObject;

    /**
     * A definition of a HEAD operation on this path.
     */
    head?: OperationObject;

    /**
     * A definition of a PATCH operation on this path.
     */
    patch?: OperationObject;

    /**
     * A definition of a TRACE operation on this path.
     */
    trace?: OperationObject;

    /**
     * An alternative server array to service all operations in this path.
     */
    servers?: ServerObject[];

    /**
     * A list of parameters that are applicable for all the operations described under this path.
     * These parameters can be overridden at the operation level, but cannot be removed there.
     * The list MUST NOT include duplicated parameters.
     */
    parameters?: (ParameterObject | ReferenceObject)[];
}

/**
 * Operation Object describes a single API operation on a path.
 */
export interface OperationObject {
    /**
     * A list of tags for API documentation control.
     * Tags can be used for logical grouping of operations by resources or any other qualifier.
     */
    tags?: string[];

    /**
     * A short summary of what the operation does.
     */
    summary?: string;

    /**
     * A verbose explanation of the operation behavior.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * Additional external documentation for this operation.
     */
    externalDocs?: ExternalDocumentationObject;

    /**
     * Unique string used to identify the operation.
     * The id MUST be unique among all operations described in the API.
     * The operationId value is case-sensitive.
     */
    operationId?: string;

    /**
     * A list of parameters that are applicable for this operation.
     * If a parameter is already defined at the Path Item, the new definition will override it but can never remove it.
     * The list MUST NOT include duplicated parameters.
     */
    parameters?: (ParameterObject | ReferenceObject)[];

    /**
     * The request body applicable for this operation.
     * The requestBody is only supported in HTTP methods where the HTTP 1.1 specification [RFC7231] has explicitly defined semantics for request bodies.
     * In other cases where the HTTP spec is vague, requestBody SHALL be ignored by consumers.
     */
    requestBody?: RequestBodyObject | ReferenceObject;

    /**
     * REQUIRED. The list of possible responses as they are returned from executing this operation.
     */
    responses: ResponsesObject;

    /**
     * A map of possible out-of-band callbacks related to the parent operation.
     * The key is a unique identifier for the Callback Object.
     * Each value in the map is a Callback Object that describes a request that may be initiated by the API provider and the expected responses.
     */
    callbacks?: Record<string, CallbackObject | ReferenceObject>;

    /**
     * Declares this operation to be deprecated.
     * Consumers SHOULD refrain from usage of the declared operation. Default value is false.
     */
    deprecated?: boolean;

    /**
     * A declaration of which security mechanisms can be used for this operation.
     * The list of values includes alternative security requirement objects that can be used.
     * Only one of the security requirement objects need to be satisfied to authorize a request.
     * To make security optional, an empty security requirement ({}) can be included in the array.
     * This definition overrides any declared top-level security.
     */
    security?: SecurityRequirementObject[];

    /**
     * An alternative server array to service this operation.
     * If an alternative server object is specified at the Path Item Object or Root level, it will be overridden by this value.
     */
    servers?: ServerObject[];
}

/**
* External Documentation Object allows referencing an external resource for extended documentation.
*/
export interface ExternalDocumentationObject {
    /**
     * A short description of the target documentation.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * REQUIRED. The URL for the target documentation.
     * Value MUST be in the format of a URL.
     */
    url: string;
}

/**
 * Parameter Object describes a single operation parameter.
 * A unique parameter is defined by a combination of a name and location.
 */
export interface ParameterObject {
    /**
     * REQUIRED. The name of the parameter.
     * Parameter names are case sensitive.
     *
     * - If in is "path", the name field MUST correspond to a template expression occurring within the path field in the Paths Object.
     * - If in is "header" and the name field is "Accept", "Content-Type" or "Authorization", the parameter definition SHALL be ignored.
     * - For all other cases, the name corresponds to the parameter name used by the in property.
     */
    name: string;

    /**
     * REQUIRED. The location of the parameter.
     * Possible values are "query", "header", "path", or "cookie".
     */
    in: "query" | "header" | "path" | "cookie";

    /**
     * A brief description of the parameter.
     * This could contain examples of use.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * Determines whether this parameter is mandatory.
     * If the parameter location is "path", this property is REQUIRED and its value MUST be true.
     * Otherwise, the property MAY be included, and its default value is false.
     */
    required?: boolean;

    /**
     * Specifies that a parameter is deprecated and SHOULD be transitioned out of usage.
     * Default value is false.
     */
    deprecated?: boolean;

    /**
     * Sets the ability to pass empty-valued parameters.
     * This is valid only for query parameters and allows sending a parameter with an empty value.
     * Default value is false.
     * If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored.
     * Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision.
     */
    allowEmptyValue?: boolean;

    /**
     * Describes how the parameter value will be serialized depending on the type of the parameter value.
     * Default values (based on value of in): for query - "form"; for path - "simple"; for header - "simple"; for cookie - "form".
     */
    style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject";

    /**
     * When this is true, parameter values of type array or object generate separate parameters for each value of the array or key-value pair of the map.
     * For other types of parameters, this property has no effect.
     * When style is "form", the default value is true.
     * For all other styles, the default value is false.
     */
    explode?: boolean;

    /**
     * Determines whether the parameter value SHOULD allow reserved characters.
     * This property only applies to parameters with an in value of query.
     * The default value is false.
     */
    allowReserved?: boolean;

    /**
     * The schema defining the type used for the parameter.
     */
    schema?: SchemaObject | ReferenceObject;

    /**
     * Example of the parameter’s potential value.
     * The example SHOULD match the specified schema and encoding properties if present.
     * The example field is mutually exclusive of the examples field.
     * Furthermore, if referencing a schema that contains an example, the example value SHALL override the example provided by the schema.
     * To represent examples of media types that cannot naturally be represented in JSON or YAML, a string value can contain the example with escaping where necessary.
     */
    example?: any;

    /**
     * Examples of the parameter’s potential value.
     * Each example SHOULD contain a value in the correct format as specified in the parameter encoding.
     * The examples field is mutually exclusive of the example field.
     * Furthermore, if referencing a schema that contains an example, the examples value SHALL override the example provided by the schema.
     */
    examples?: Record<string, ExampleObject | ReferenceObject>;

    /**
     * A map containing the representations for the parameter.
     * The key is the media type and the value describes it.
     * The map MUST only contain one entry.
     */
    content?: Record<string, MediaTypeObject>;
}

/**
* Request Body Object describes a single request body.
*/
export interface RequestBodyObject {
    /**
     * A brief description of the request body.
     * This could contain examples of use.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * REQUIRED. The content of the request body.
     * The key is a media type or media type range, and the value describes it.
     * For requests that match multiple keys, only the most specific key is applicable.
     * e.g. text/plain overrides text/*
     */
    content: Record<string, MediaTypeObject>;

    /**
     * Determines if the request body is required in the request.
     * Defaults to false.
     */
    required?: boolean;
}

/**
 * Media Type Object provides schema and examples for the media type identified by its key.
 */
export interface MediaTypeObject {
    /**
     * The schema defining the content of the request, response, or parameter.
     */
    schema?: SchemaObject | ReferenceObject;

    /**
     * Example of the media type.
     * The example object SHOULD be in the correct format as specified by the media type.
     * The example field is mutually exclusive of the examples field.
     * Furthermore, if referencing a schema that contains an example, the example value SHALL override the example provided by the schema.
     */
    example?: any;

    /**
     * Examples of the media type.
     * Each example object SHOULD match the media type and specified schema if present.
     * The examples field is mutually exclusive of the example field.
     * Furthermore, if referencing a schema that contains an example, the examples value SHALL override the example provided by the schema.
     */
    examples?: Record<string, ExampleObject | ReferenceObject>;

    /**
     * A map between a property name and its encoding information.
     * The key, being the property name, MUST exist in the schema as a property.
     * The encoding object SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded.
     */
    encoding?: Record<string, EncodingObject>;
}

/**
 * Encoding Object is a single encoding definition applied to a single schema property.
 */
export interface EncodingObject {
    /**
     * The Content-Type for encoding a specific property.
     * Default value depends on the property type:
     * - for string with format being binary – application/octet-stream
     * - for other primitive types – text/plain
     * - for object - application/json
     * - for array – the default is defined based on the inner type.
     * The value can be a specific media type (e.g., application/json), a wildcard media type (e.g., image/*),
     * or a comma-separated list of the two types.
     */
    contentType?: string;

    /**
     * A map allowing additional information to be provided as headers, for example, Content-Disposition.
     * Content-Type is described separately and SHALL be ignored in this section.
     * This property SHALL be ignored if the request body media type is not multipart.
     */
    headers?: Record<string, HeaderObject | ReferenceObject>;

    /**
     * Describes how a specific property value will be serialized depending on its type.
     * See Parameter Object for details on the style property.
     * The behavior follows the same values as query parameters, including default values.
     * This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded.
     */
    style?: string;

    /**
     * When this is true, property values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map.
     * For other types of properties, this property has no effect.
     * When style is "form", the default value is true.
     * For all other styles, the default value is false.
     * This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded.
     */
    explode?: boolean;

    /**
     * Determines whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] :/?#[]@!$&'()*+,;= to be included without percent-encoding.
     * The default value is false.
     * This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded.
     */
    allowReserved?: boolean;
}

/**
 * Response Object describes a single response from an API Operation, including design-time, static links to operations based on the response.
 */
export interface ResponseObject {
    /**
     * REQUIRED. A short description of the response.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description: string;

    /**
     * Maps a header name to its definition.
     * [RFC7230] states header names are case insensitive.
     * If a response header is defined with the name "Content-Type", it SHALL be ignored.
     */
    headers?: Record<string, HeaderObject | ReferenceObject>;

    /**
     * A map containing descriptions of potential response payloads.
     * The key is a media type or media type range, and the value describes it.
     * For responses that match multiple keys, only the most specific key is applicable.
     * e.g. text/plain overrides text/*
     */
    content?: Record<string, MediaTypeObject>;

    /**
     * A map of operations links that can be followed from the response.
     * The key of the map is a short name for the link, following the naming constraints of the names for Component Objects.
     */
    links?: Record<string, LinkObject | ReferenceObject>;
}

/**
* Callback Object represents a map of possible out-of-band callbacks related to the parent operation.
* Each value in the map is a Path Item Object that describes a set of requests that may be initiated by the API provider and the expected responses.
* The key value used to identify the path item object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.
*/
export interface CallbackObject {
    [expression: string]: PathItemObject;
}

/**
* Example Object represents an example in the API documentation.
*/
export interface ExampleObject {
    summary?: string; // Short description for the example
    description?: string; // Long description for the example
    value?: any; // Embedded literal example
    externalValue?: string; // A URL that points to the literal example
}

/**
 * Link Object represents a possible design-time link for a response.
 */
export interface LinkObject {
    operationRef?: string; // A relative or absolute URI reference to an OAS operation
    operationId?: string; // The name of an existing, resolvable OAS operation
    parameters?: { [name: string]: any | { expression: string } }; // Parameters to pass to the linked operation
    requestBody?: any | { expression: string }; // Request body to use when calling the target operation
    description?: string; // A description of the link
    server?: ServerObject; // A server object to be used by the target operation
}

/**
 * Header Object represents a header parameter in the API documentation.
 */
export interface HeaderObject {
    description?: string; // A brief description of the header
    required?: boolean; // Determines whether this header is mandatory
    deprecated?: boolean; // Specifies that a header is deprecated
    allowEmptyValue?: boolean; // Sets the ability to pass empty-valued headers
    style?: string; // Describes how the header value will be serialized
    explode?: boolean; // When true, header values generate separate parameters
    allowReserved?: boolean; // Determines whether the header value SHOULD allow reserved characters
    schema?: SchemaObject | ReferenceObject; // The schema defining the type used for the header
    example?: any; // Example of the header's potential value
    examples?: { [key: string]: ExampleObject | ReferenceObject }; // Examples of the header's potential value
}

/**
 * Tag Object adds metadata to a single tag that is used by the Operation Object.
 */
export interface TagObject {
    name: string; // The name of the tag
    description?: string; // A short description for the tag
    externalDocs?: ExternalDocumentationObject; // Additional external documentation for this tag
}

/**
 * Reference Object allows referencing other components in the specification.
 */
export interface ReferenceObject {
    $ref: string; // The reference string
}

/**
 * Schema Object represents a data type definition.
 */
export interface SchemaObject {
    title?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string; // Regular expression
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];

    type?: string; // Single type, multiple types not supported
    allOf?: (SchemaObject | ReferenceObject)[]; // Array of Schema Objects or Reference Objects
    oneOf?: (SchemaObject | ReferenceObject)[]; // Array of Schema Objects or Reference Objects
    anyOf?: (SchemaObject | ReferenceObject)[]; // Array of Schema Objects or Reference Objects
    not?: SchemaObject | ReferenceObject; // Schema Object or Reference Object
    items?: SchemaObject | ReferenceObject; // Schema Object or Reference Object
    properties?: { [key: string]: SchemaObject | ReferenceObject }; // Map of property names to Schema Objects or Reference Objects
    additionalProperties?: boolean | SchemaObject | ReferenceObject; // Boolean or Schema Object or Reference Object
    description?: string;
    format?: string;
    default?: any;

    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XMLObject;
    externalDocs?: ExternalDocumentationObject;
    example?: any;
    deprecated?: boolean;
}

/**
 * Reference Object allows referencing other components in the specification.
 */
export interface ReferenceObject {
    $ref: string; // The reference string
}

/**
 * Discriminator Object for polymorphism.
 */
export interface DiscriminatorObject {
    propertyName: string; // The name of the property that decides which schema definition validates the structure
    mapping?: { [key: string]: string }; // A map that provides the schema name to use for a given discriminator value
}

/**
 * XML Object for describing the XML representation of a schema property.
 */
export interface XMLObject {
    name?: string; // The name of the XML element when serialized
    namespace?: string; // The XML namespace
    prefix?: string; // The prefix to use for the XML element
    attribute?: boolean; // Indicates if the property should be serialized as an attribute
    wrapped?: boolean; // Indicates if the property should be wrapped in an XML element
}

/**
 * External Documentation Object for providing additional external documentation.
 */
export interface ExternalDocumentationObject {
    description?: string; // A short description of the external documentation
    url: string; // The URL for the external documentation
}

// Additional types needed for completeness
type SchemaType =
    | 'array'
    | 'boolean'
    | 'integer'
    | 'number'
    | 'object'
    | 'string';

/**
* Responses Object describes the expected responses of an operation.
*/
export interface ResponsesObject {
    default?: ResponseObject | ReferenceObject;
    [statusCode: string]: ResponseObject | ReferenceObject | undefined;
}

/**
* Security Requirement Object lists the required security schemes to execute this operation.
*/
export interface SecurityRequirementObject {
    [schemeName: string]: string[]; // Key is the security scheme name, value is a list of required scopes
}

/**
* Defines a security scheme that can be used by the operations.
* Supported schemes are HTTP authentication, an API key (either as a header, a cookie parameter, or as a query parameter),
* OAuth2’s common flows (implicit, password, client credentials, and authorization code) as defined in RFC6749,
* and OpenID Connect Discovery.
*/
export interface SecuritySchemeObject {
    /**
     * The type of the security scheme.
     * Valid values are "apiKey", "http", "oauth2", "openIdConnect".
     * @required
     */
    type: "apiKey" | "http" | "oauth2" | "openIdConnect";

    /**
     * A short description for the security scheme.
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
     * The name of the header, query, or cookie parameter to be used when using an API key for authentication.
     * @required for type "apiKey"
     */
    name?: string;

    /**
     * The location of the API key.
     * Valid values are "query", "header", or "cookie".
     * @required for type "apiKey"
     */
    in?: "query" | "header" | "cookie";

    /**
     * The name of the HTTP Authorization scheme to be used in the Authorization header as defined in RFC7235.
     * The values used SHOULD be registered in the IANA Authentication Scheme registry.
     * @required for type "http"
     */
    scheme?: string;

    /**
     * A hint to the client to identify how the bearer token is formatted.
     * Bearer tokens are usually generated by an authorization server, so this information is primarily for documentation purposes.
     * @required for type "http" with the "bearer" scheme
     */
    bearerFormat?: string;

    /**
     * An object containing configuration information for the flow types supported.
     * @required for type "oauth2"
     */
    flows?: OAuthFlowsObject;

    /**
     * OpenID Connect URL to discover OAuth2 configuration values.
     * This MUST be in the form of a URL.
     * @required for type "openIdConnect"
     */
    openIdConnectUrl?: string;
}

/**
 * Configuration details for a supported OAuth Flow.
 */
export interface OAuthFlowObject {
    /**
     * The authorization URL to be used for this flow.
     * This MUST be in the form of a URL.
     * @required for flow types "implicit" and "authorizationCode"
     */
    authorizationUrl?: string;

    /**
     * The token URL to be used for this flow.
     * This MUST be in the form of a URL.
     * @required for flow types "password", "clientCredentials", and "authorizationCode"
     */
    tokenUrl?: string;

    /**
     * The URL to be used for obtaining refresh tokens.
     * This MUST be in the form of a URL.
     */
    refreshUrl?: string;

    /**
     * The available scopes for the OAuth2 security scheme.
     * A map between the scope name and a short description for it.
     * The map MAY be empty.
     * @required
     */
    scopes: Record<string, string>;
}

/**
 * Allows configuration of the supported OAuth Flows.
 */
export interface OAuthFlowsObject {
    /**
     * Configuration for the OAuth Implicit flow.
     */
    implicit?: OAuthFlowObject;

    /**
     * Configuration for the OAuth Resource Owner Password flow.
     */
    password?: OAuthFlowObject;

    /**
     * Configuration for the OAuth Client Credentials flow (previously called "application" in OpenAPI 2.0).
     */
    clientCredentials?: OAuthFlowObject;

    /**
     * Configuration for the OAuth Authorization Code flow (previously called "accessCode" in OpenAPI 2.0).
     */
    authorizationCode?: OAuthFlowObject;
}
